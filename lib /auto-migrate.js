// 自动数据库迁移模块 - 核心协议表
// 应用启动时自动检查和创建协议核心表
// 对应 IETF 草案：draft-wang-hjs-judgment-event-00
//
// 创建的表：
// - delegations   : 委托记录（草案 3.2.2）
// - terminations  : 终止记录（草案 3.2.3）
// - verifications : 验证记录（草案 3.2.4）
//
// 修改的表：
// - judgments     : 添加幂等性字段

const CORE_MIGRATE_SQL = `
-- 检查并创建 schema_migrations 表
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT NOW()
);

-- ========== 迁移 001: 为 judgments 添加幂等性字段 ==========
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='judgments' AND column_name='idempotency_key') THEN
        ALTER TABLE judgments ADD COLUMN idempotency_key VARCHAR(64);
        CREATE UNIQUE INDEX idx_judgments_idempotency ON judgments(idempotency_key) WHERE idempotency_key IS NOT NULL;
        INSERT INTO schema_migrations (version) VALUES ('001_judgments_idempotency') ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ========== 迁移 002: 创建 delegations 表 ==========
-- 对应 IETF 草案 Section 3.2.2 - Delegate
CREATE TABLE IF NOT EXISTS delegations (
    id VARCHAR(50) PRIMARY KEY,
    delegator VARCHAR(255) NOT NULL,
    delegatee VARCHAR(255) NOT NULL,
    judgment_id VARCHAR(50) REFERENCES judgments(id),
    scope JSONB DEFAULT '{}',
    expiry TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    anchor_type VARCHAR(20) DEFAULT 'none',
    anchor_reference TEXT,
    anchor_proof BYTEA,
    anchor_processed_at TIMESTAMP,
    idempotency_key VARCHAR(64)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_delegations_idempotency ON delegations(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_delegations_delegator ON delegations(delegator);
CREATE INDEX IF NOT EXISTS idx_delegations_delegatee ON delegations(delegatee);
CREATE INDEX IF NOT EXISTS idx_delegations_judgment ON delegations(judgment_id);
CREATE INDEX IF NOT EXISTS idx_delegations_status ON delegations(status);

-- ========== 迁移 003: 创建 terminations 表 ==========
-- 对应 IETF 草案 Section 3.2.3 - Terminate
CREATE TABLE IF NOT EXISTS terminations (
    id VARCHAR(50) PRIMARY KEY,
    terminator VARCHAR(255) NOT NULL,
    target_id VARCHAR(50) NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('judgment', 'delegation')),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    anchor_type VARCHAR(20) DEFAULT 'none',
    anchor_reference TEXT,
    anchor_proof BYTEA,
    anchor_processed_at TIMESTAMP,
    idempotency_key VARCHAR(64)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_terminations_idempotency ON terminations(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_terminations_target ON terminations(target_id);
CREATE INDEX IF NOT EXISTS idx_terminations_terminator ON terminations(terminator);

-- ========== 迁移 004: 创建 verifications 表 ==========
-- 对应 IETF 草案 Section 3.2.4 - Verify
CREATE TABLE IF NOT EXISTS verifications (
    id VARCHAR(50) PRIMARY KEY,
    verifier VARCHAR(255) NOT NULL,
    target_id VARCHAR(50) NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('judgment', 'delegation', 'termination')),
    result VARCHAR(20) NOT NULL CHECK (result IN ('VALID', 'INVALID', 'PENDING')),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verifications_target ON verifications(target_id);
CREATE INDEX IF NOT EXISTS idx_verifications_verifier ON verifications(verifier);
`;

/**
 * 自动迁移核心协议表
 * @param {Pool} pool - PostgreSQL 连接池
 */
async function autoMigrateCore(pool) {
    console.log('🔍 Checking core database schema...');
    
    try {
        const client = await pool.connect();
        try {
            await client.query(CORE_MIGRATE_SQL);
            
            // 验证迁移是否成功
            const { rows } = await client.query(
                "SELECT version FROM schema_migrations ORDER BY applied_at DESC LIMIT 1"
            );
            
            console.log(`✅ Core database schema is up to date (last migration: ${rows[0]?.version || 'none'})`);
        } finally {
            client.release();
        }
    } catch (err) {
        // 迁移失败不应阻止应用启动
        console.error('⚠️  Core auto-migration warning:', err.message);
        console.log('   Continuing with existing schema...');
    }
}

module.exports = { autoMigrateCore };

// HJS 沙盒环境管理
// 为开发者提供隔离的测试环境
//
// 沙盒环境用于：
// - 测试 API 功能
// - 开发和调试集成
// - 学习和体验 HJS 协议
//
// 所有沙盒数据会在 24 小时后自动清理

const crypto = require('crypto');

// 沙盒配置
const SANDBOX_CONFIG = {
    // 免费额度（可根据部署需求调整）
    freeQuota: {
        judgments: 1000,      // 每日 1000 条记录
        anchors: 10,          // 每日 10 次锚定
        apiCalls: 10000,      // 每日 10000 次调用
        storage: 100 * 1024 * 1024  // 100MB 存储
    },
    // 数据保留期（24 小时）
    dataRetention: 24 * 60 * 60 * 1000,
    // 清理间隔（每小时）
    cleanupInterval: 60 * 60 * 1000
};

class SandboxManager {
    constructor(pool) {
        this.pool = pool;
        this.startCleanupJob();
    }
    
    // 判断是否为沙盒请求
    isSandboxRequest(apiKey) {
        return apiKey && apiKey.startsWith('sk_sandbox_');
    }
    
    // 获取沙盒账户 ID
    getSandboxAccountId(realAccountId) {
        return `${realAccountId}_sandbox`;
    }
    
    // 创建沙盒记录（添加隔离标记）
    async createSandboxRecord(table, data) {
        return {
            ...data,
            _sandbox: true,
            _created_at: new Date().toISOString(),
            _expires_at: new Date(Date.now() + SANDBOX_CONFIG.dataRetention).toISOString()
        };
    }
    
    // 检查沙盒额度
    async checkQuota(accountId) {
        const today = new Date().toISOString().split('T')[0];
        
        const result = await this.pool.query(
            `SELECT 
                SUM(judgment_count) as judgments,
                SUM(anchor_count) as anchors,
                SUM(api_calls) as api_calls
             FROM account_usage
             WHERE account_id = $1 AND date = $2`,
            [accountId, today]
        );
        
        const usage = result.rows[0] || { judgments: 0, anchors: 0, api_calls: 0 };
        
        return {
            usage: {
                judgments: parseInt(usage.judgments) || 0,
                anchors: parseInt(usage.anchors) || 0,
                api_calls: parseInt(usage.api_calls) || 0
            },
            quota: SANDBOX_CONFIG.freeQuota,
            remaining: {
                judgments: Math.max(0, SANDBOX_CONFIG.freeQuota.judgments - (parseInt(usage.judgments) || 0)),
                anchors: Math.max(0, SANDBOX_CONFIG.freeQuota.anchors - (parseInt(usage.anchors) || 0)),
                api_calls: Math.max(0, SANDBOX_CONFIG.freeQuota.apiCalls - (parseInt(usage.api_calls) || 0))
            }
        };
    }
    
    // 验证沙盒操作
    async validateOperation(accountId, operation) {
        const quota = await this.checkQuota(accountId);
        
        const limits = {
            'judgment.create': 'judgments',
            'anchor.submit': 'anchors',
            'api.call': 'api_calls'
        };
        
        const limitKey = limits[operation];
        if (limitKey && quota.remaining[limitKey] <= 0) {
            return {
                allowed: false,
                error: `Sandbox quota exceeded for ${limitKey}`,
                quota: quota.quota,
                usage: quota.usage,
                message: 'Daily quota reached. Data will reset in 24 hours.'
            };
        }
        
        return { allowed: true, quota };
    }
    
    // 记录沙盒用量
    async recordUsage(accountId, operation) {
        const today = new Date().toISOString().split('T')[0];
        const increments = {
            'judgment.create': { judgments: 1 },
            'anchor.submit': { anchors: 1 },
            'api.call': { api_calls: 1 }
        };
        
        const inc = increments[operation] || { api_calls: 1 };
        
        await this.pool.query(
            `INSERT INTO account_usage (account_id, date, judgment_count, anchor_count, api_calls)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (account_id, date)
             DO UPDATE SET
                judgment_count = account_usage.judgment_count + $3,
                anchor_count = account_usage.anchor_count + $4,
                api_calls = account_usage.api_calls + $5`,
            [accountId, today, inc.judgments || 0, inc.anchors || 0, inc.api_calls || 0]
        );
    }
    
    // 清理过期沙盒数据
    async cleanup() {
        const cutoff = new Date(Date.now() - SANDBOX_CONFIG.dataRetention);
        
        console.log('🧹 Starting sandbox cleanup...');
        
        try {
            // 清理过期的 judgments
            const judgmentsResult = await this.pool.query(
                `DELETE FROM judgments 
                 WHERE account_id LIKE '%_sandbox' 
                 AND recorded_at < $1
                 RETURNING id`,
                [cutoff]
            );
            
            // 清理过期的 delegations
            const delegationsResult = await this.pool.query(
                `DELETE FROM delegations 
                 WHERE account_id LIKE '%_sandbox' 
                 AND created_at < $1
                 RETURNING id`,
                [cutoff]
            );
            
            // 清理过期的 terminations
            const terminationsResult = await this.pool.query(
                `DELETE FROM terminations 
                 WHERE account_id LIKE '%_sandbox' 
                 AND created_at < $1
                 RETURNING id`,
                [cutoff]
            );
            
            console.log(`✅ Sandbox cleanup complete:`);
            console.log(`   - Judgments: ${judgmentsResult.rowCount}`);
            console.log(`   - Delegations: ${delegationsResult.rowCount}`);
            console.log(`   - Terminations: ${terminationsResult.rowCount}`);
            
            return {
                judgments: judgmentsResult.rowCount,
                delegations: delegationsResult.rowCount,
                terminations: terminationsResult.rowCount
            };
        } catch (err) {
            console.error('❌ Sandbox cleanup error:', err);
            throw err;
        }
    }
    
    // 启动定时清理任务
    startCleanupJob() {
        // 立即执行一次
        this.cleanup().catch(() => {});
        
        // 定时执行
        setInterval(() => {
            this.cleanup().catch(() => {});
        }, SANDBOX_CONFIG.cleanupInterval);
        
        console.log('🔄 Sandbox cleanup job started');
    }
    
    // 获取沙盒状态
    async getStatus(accountId) {
        const quota = await this.checkQuota(accountId);
        const dataAge = await this.getOldestDataAge(accountId);
        
        return {
            environment: 'sandbox',
            quota: quota,
            data_retention: {
                max_age: '24 hours',
                current_oldest: dataAge
            },
            features: {
                anchoring: true,
                webhooks: false,  // 沙盒暂不支持 webhook
                export: true
            }
        };
    }
    
    // 获取最旧数据年龄
    async getOldestDataAge(accountId) {
        const result = await this.pool.query(
            `SELECT MIN(recorded_at) as oldest 
             FROM judgments 
             WHERE account_id = $1`,
            [accountId]
        );
        
        if (!result.rows[0]?.oldest) {
            return null;
        }
        
        const age = Date.now() - new Date(result.rows[0].oldest).getTime();
        return {
            timestamp: result.rows[0].oldest,
            age_hours: Math.round(age / 1000 / 60 / 60 * 100) / 100
        };
    }
    
    // 重置沙盒数据
    async reset(accountId) {
        const tables = ['judgments', 'delegations', 'terminations', 'verifications'];
        
        for (const table of tables) {
            await this.pool.query(
                `DELETE FROM ${table} WHERE account_id = $1`,
                [accountId]
            );
        }
        
        // 重置用量统计
        const today = new Date().toISOString().split('T')[0];
        await this.pool.query(
            `DELETE FROM account_usage WHERE account_id = $1 AND date = $2`,
            [accountId, today]
        );
        
        return { reset: true, tables_affected: tables };
    }
}

// Express 中间件：沙盒处理
function sandboxMiddleware(sandboxManager) {
    return async (req, res, next) => {
        const apiKey = req.headers['x-api-key'];
        
        // 检查是否为沙盒请求
        if (sandboxManager.isSandboxRequest(apiKey)) {
            req.isSandbox = true;
            
            // 如果已认证，检查额度
            if (req.account && req.account.id) {
                const validation = await sandboxManager.validateOperation(
                    req.account.id,
                    req.method === 'POST' ? 'judgment.create' : 'api.call'
                );
                
                if (!validation.allowed) {
                    return res.status(429).json({
                        error: 'Sandbox quota exceeded',
                        details: {
                            quota: validation.quota,
                            usage: validation.usage,
                            message: validation.message
                        }
                    });
                }
                
                // 记录用量
                await sandboxManager.recordUsage(
                    req.account.id,
                    req.method === 'POST' ? 'judgment.create' : 'api.call'
                );
            }
        }
        
        next();
    };
}

module.exports = {
    SandboxManager,
    sandboxMiddleware,
    SANDBOX_CONFIG
};

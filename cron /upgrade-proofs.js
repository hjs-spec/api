// cron/upgrade-proofs.js
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Human Judgment Systems Foundation Ltd.
//
// 定时升级 OTS 锚定证明
// 每小时运行一次，将未确认的 OTS 证明升级到区块链确认状态

const { Pool } = require('pg');
const { upgradeAnchor } = require('../lib/anchor');
const cron = require('node-cron');

// 数据库连接池配置
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5  // 限制最大连接数，避免连接过多
});

/**
 * 执行锚定证明升级任务
 */
async function runAnchorUpgrade() {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] 🚀 Starting anchor upgrade task...`);
  
  try {
    // 查询所有需要升级的锚定
    const { rows } = await pool.query(
      `SELECT id, anchor_type, anchor_proof 
       FROM judgments 
       WHERE anchor_proof IS NOT NULL 
         AND anchor_processed_at IS NULL
         AND anchor_type IN ('ots')`
    );

    console.log(`📊 Found ${rows.length} proofs to upgrade`);

    if (rows.length === 0) {
      console.log(`[${new Date().toISOString()}] ✨ No proofs to upgrade`);
      return;
    }

    let successCount = 0;
    let alreadyLatestCount = 0;
    let errorCount = 0;

    for (const row of rows) {
      try {
        console.log(`⏫ Upgrading anchor for record ${row.id}...`);
        const upgraded = await upgradeAnchor(row.anchor_type, row.anchor_proof);
        
        if (upgraded) {
          await pool.query(
            `UPDATE judgments 
             SET anchor_proof = $1, anchor_processed_at = NOW() 
             WHERE id = $2`,
            [upgraded, row.id]
          );
          console.log(`✅ Upgraded anchor for record ${row.id}`);
          successCount++;
        } else {
          console.log(`⏳ Anchor for record ${row.id} is already at latest state`);
          alreadyLatestCount++;
        }
      } catch (err) {
        console.error(`❌ Failed to upgrade record ${row.id}:`, err.message);
        errorCount++;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[${new Date().toISOString()}] 📊 Task completed in ${duration}s`);
    console.log(`   - ✅ Success: ${successCount}`);
    console.log(`   - ⏳ Already latest: ${alreadyLatestCount}`);
    console.log(`   - ❌ Failed: ${errorCount}`);

  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Anchor upgrade task error:`, err);
  }
}

// 如果直接运行此脚本（而非被导入）
if (require.main === module) {
  // 每小时运行一次
  cron.schedule('0 * * * *', () => {
    runAnchorUpgrade().catch(console.error);
  });

  console.log(`[${new Date().toISOString()}] ⏰ Anchor upgrade cron job started (hourly)`);

  // 进程退出时清理
  process.on('SIGTERM', async () => {
    console.log(`[${new Date().toISOString()}] Received SIGTERM, shutting down...`);
    await pool.end();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log(`[${new Date().toISOString()}] Received SIGINT, shutting down...`);
    await pool.end();
    process.exit(0);
  });
}

// 导出函数以便其他模块调用
module.exports = { runAnchorUpgrade };

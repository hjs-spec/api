// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Human Judgment Systems Foundation Ltd.
//
// HJS Protocol Core API - IETF draft-wang-hjs-judgment-event-00
// Implements: Judgment, Delegation, Termination, Verification

const { Pool } = require('pg');
const express = require('express');
require('dotenv').config();
const { generateRecordHash } = require('./lib/canonical');
const { submitToOTS } = require('./lib/ots-utils');
const { anchorRecord } = require('./lib/anchor');
const { validateInput, sanitizeInput } = require('./lib/validation');
const { autoMigrate } = require('./lib/auto-migrate');
const { authenticateApiKey } = require('./lib/auth');  // 简化版认证
const { versionNegotiation } = require('./lib/versioning');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const cors = require('cors');

// 加载 HJS Extension (Delegation, Termination, Verification)
let hjsExtension;
try {
  hjsExtension = require('./hjs-extension');
  console.log('✅ HJS Extension loaded');
} catch (err) {
  console.error('⚠️ HJS Extension failed to load:', err.message);
}

const app = express();
const port = process.env.PORT || 3000;

// 数据库连接
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static('public'));

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
  handler: (req, res) => res.status(429).json({ error: 'Too many requests' })
});

// 健康检查
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy' });
  }
});

// API文档
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'HJS Protocol API',
    version: '1.0.0',
    description: 'Implementation of IETF draft-wang-hjs-judgment-event',
    endpoints: {
      '/judgments': 'Record and query judgment events',
      '/delegations': 'Transfer authority',
      '/terminations': 'End responsibility chains',
      '/verify': 'Verify records'
    }
  });
});

// 核心原语 API - Judgment
app.post('/judgments', limiter, authenticateApiKey(pool), async (req, res) => {
  const { entity, action, scope, timestamp, immutability } = req.body;
  
  if (!entity || !action) {
    return res.status(400).json({ error: 'entity and action required' });
  }

  const id = 'jgd_' + Date.now() + Math.random().toString(36).substring(2, 6);
  const eventTime = timestamp || new Date().toISOString();
  const anchorType = immutability?.type || 'none';

  try {
    let anchorResult = null;
    if (anchorType === 'ots') {
      const record = { id, entity, action, scope, timestamp: eventTime };
      const hash = generateRecordHash(record);
      anchorResult = await anchorRecord(anchorType, hash, immutability?.options);
    }

    await pool.query(
      `INSERT INTO judgments (id, entity, action, scope, timestamp, recorded_at, anchor_type, anchor_reference, anchor_proof, anchor_processed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, entity, action, scope || {}, eventTime, new Date().toISOString(),
       anchorResult?.type || 'none', anchorResult?.reference, anchorResult?.proof, anchorResult?.anchoredAt]
    );

    res.json({
      id,
      status: 'recorded',
      protocol: 'HJS/1.0',
      timestamp: new Date().toISOString(),
      immutability_anchor: anchorResult ? {
        type: anchorResult.type,
        reference: anchorResult.reference,
        anchored_at: anchorResult.anchoredAt
      } : { type: 'none' }
    });
  } catch (err) {
    console.error('Judgment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 查询 Judgment
app.get('/judgments/:id', limiter, authenticateApiKey(pool), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM judgments WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

// 加载 HJS Extension 路由 (Delegation, Termination, Verification)
if (hjsExtension) {
  await hjsExtension.initHJSExtensionTables(pool);
  const hjsExtensionRouter = hjsExtension.createHJSExtensionRouter(pool, authenticateApiKey, limiter);
  app.use('/', hjsExtensionRouter);
}

// 统一验证入口
app.post('/verify', limiter, async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });

  // 自动检测类型
  let type = 'unknown';
  if (id.startsWith('jgd_')) type = 'judgment';
  else if (id.startsWith('dlg_')) type = 'delegation';
  else if (id.startsWith('trm_')) type = 'termination';

  // 调用相应的验证函数
  let result;
  if (type === 'judgment') {
    result = await pool.query('SELECT * FROM judgments WHERE id = $1', [id]);
  } else if (type === 'delegation' && hjsExtension) {
    result = await hjsExtension.verifyDelegationChain(pool, id);
  } else if (type === 'termination') {
    result = await pool.query('SELECT * FROM terminations WHERE id = $1', [id]);
  }

  res.json({
    id,
    type,
    valid: !!result?.rows?.length || result?.valid
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 HJS API running on port ${port}`);
});

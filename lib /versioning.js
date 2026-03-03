// HJS API 版本控制系统
// 支持 URL 版本化和 Header 版本化
//
// 版本策略：
// - 主版本号在 URL 中指定 (e.g., /v1/judgments)
// - 次版本/补丁版本通过 Accept-Version header 协商
// - 向后兼容的变更不会产生新版本
// - 不兼容的变更会产生新的主版本

const express = require('express');

/**
 * API 版本配置
 * 仅包含公开的版本信息
 */
const API_VERSIONS = {
    '1.0.0': {
        path: '/v1',
        status: 'stable',
        sunset: null,  // 无废弃计划
        releaseDate: '2026-02-24'
    },
    '0.9.0': {
        path: '/v0',
        status: 'deprecated',
        sunset: '2026-06-01',  // 废弃日期
        message: 'Please upgrade to /v1',
        releaseDate: '2026-02-01'
    }
};

/**
 * 版本协商中间件
 * 根据请求头和 URL 确定使用的 API 版本
 * 优先级：URL > Header > 默认版本
 * 
 * 响应头说明：
 * - X-API-Version: 当前使用的版本
 * - X-API-Latest-Version: 最新稳定版本
 * - X-API-Deprecated: 如果使用废弃版本会返回此头
 * - X-API-Sunset-Date: 废弃版本的截止日期
 */
function versionNegotiation() {
    return (req, res, next) => {
        // 从 URL 路径中提取版本（如 /v1/judgments）
        const pathMatch = req.path.match(/^\/v(\d+)(\/|$)/);
        let version = null;
        
        if (pathMatch) {
            const majorVersion = pathMatch[1];
            version = Object.keys(API_VERSIONS).find(v => v.startsWith(majorVersion));
            req.apiVersionSource = 'url';
        }
        
        // 如果 URL 没有指定，检查 Header
        if (!version) {
            const headerVersion = req.headers['x-api-version'] || req.headers['accept-version'];
            if (headerVersion) {
                version = Object.keys(API_VERSIONS).find(v => v.startsWith(headerVersion));
                req.apiVersionSource = 'header';
            }
        }
        
        // 默认版本
        if (!version) {
            version = '1.0.0';
            req.apiVersionSource = 'default';
        }
        
        // 验证版本是否存在
        const versionInfo = API_VERSIONS[version];
        if (!versionInfo) {
            return res.status(400).json({
                error: 'Unsupported API version',
                requested: version,
                supported: Object.keys(API_VERSIONS).filter(v => API_VERSIONS[v].status === 'stable')
            });
        }
        
        // 附加版本信息到请求对象
        req.apiVersion = version;
        req.apiVersionInfo = versionInfo;
        
        // 设置响应头
        res.setHeader('X-API-Version', version);
        res.setHeader('X-API-Latest-Version', '1.0.0');
        
        // 如果使用废弃版本，添加警告头
        if (versionInfo.status === 'deprecated') {
            res.setHeader('X-API-Deprecated', 'true');
            if (versionInfo.sunset) {
                res.setHeader('X-API-Sunset-Date', versionInfo.sunset);
            }
            if (versionInfo.message) {
                res.setHeader('X-API-Upgrade-Message', versionInfo.message);
            }
        }
        
        next();
    };
}

/**
 * 创建版本化路由
 * @param {Pool} pool - PostgreSQL 连接池
 * @param {Function} authenticateApiKey - 认证中间件
 * @param {Function} limiter - 限流中间件
 * @returns {Router} Express 路由
 */
function createVersionRouter(pool, authenticateApiKey, limiter) {
    const router = express.Router();
    
    // ========== v1 路由（当前稳定版） ==========
    const v1Router = express.Router();
    
    // v1 版本信息
    v1Router.get('/', (req, res) => {
        res.json({
            version: '1.0.0',
            status: 'stable',
            releaseDate: '2026-02-24',
            baseUrl: '/v1',
            documentation: 'https://docs.hjs.sh/v1',
            endpoints: {
                judgments: '/v1/judgments',
                delegations: '/v1/delegations',
                terminations: '/v1/terminations',
                verifications: '/v1/verifications'
            }
        });
    });
    
    // v1 健康检查
    v1Router.get('/health', async (req, res) => {
        try {
            await pool.query('SELECT NOW()');
            res.json({
                version: '1.0.0',
                status: 'healthy',
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            res.status(503).json({
                version: '1.0.0',
                status: 'unhealthy',
                error: 'Database connection failed'
            });
        }
    });
    
    // v1 API 路由 - 这些将在 index.js 中具体实现
    v1Router.get('/judgments', authenticateApiKey, limiter, (req, res) => {
        // 转发到主路由的处理函数
        req.url = '/judgments';
        router.handle(req, res);
    });
    
    v1Router.post('/judgments', authenticateApiKey, limiter, (req, res) => {
        req.url = '/judgments';
        router.handle(req, res);
    });
    
    v1Router.get('/delegations', authenticateApiKey, limiter, (req, res) => {
        req.url = '/delegations';
        router.handle(req, res);
    });
    
    v1Router.post('/delegations', authenticateApiKey, limiter, (req, res) => {
        req.url = '/delegations';
        router.handle(req, res);
    });
    
    v1Router.get('/terminations', authenticateApiKey, limiter, (req, res) => {
        req.url = '/terminations';
        router.handle(req, res);
    });
    
    v1Router.post('/terminations', authenticateApiKey, limiter, (req, res) => {
        req.url = '/terminations';
        router.handle(req, res);
    });
    
    v1Router.post('/verifications', authenticateApiKey, limiter, (req, res) => {
        req.url = '/verifications';
        router.handle(req, res);
    });
    
    v1Router.post('/verify', limiter, (req, res) => {
        req.url = '/verify';
        router.handle(req, res);
    });
    
    router.use('/v1', v1Router);
    
    // ========== v0 路由（废弃版本） ==========
    const v0Router = express.Router();
    
    // v0 中间件 - 添加废弃警告
    v0Router.use((req, res, next) => {
        res.setHeader('X-API-Deprecated', 'true');
        res.setHeader('X-API-Sunset-Date', '2026-06-01');
        res.setHeader('X-API-Message', 'v0 is deprecated, please upgrade to v1');
        next();
    });
    
    // v0 版本信息
    v0Router.get('/', (req, res) => {
        res.json({
            version: '0.9.0',
            status: 'deprecated',
            releaseDate: '2026-02-01',
            sunsetDate: '2026-06-01',
            message: 'This version will be removed on 2026-06-01',
            upgradeGuide: 'Please migrate to /v1 - see https://docs.hjs.sh/migration'
        });
    });
    
    // v0 API 路由重定向到 v1
    v0Router.all('*', (req, res) => {
        // 如果是 API 请求，返回 JSON 重定向
        if (req.headers.accept?.includes('application/json')) {
            res.status(301).json({
                error: 'v0 API is deprecated',
                message: 'Please upgrade to v1',
                upgradeUrl: '/v1' + req.path,
                sunsetDate: '2026-06-01',
                migrationGuide: 'https://docs.hjs.sh/migration'
            });
        } else {
            // 浏览器访问时重定向
            res.redirect(301, '/v1' + req.path);
        }
    });
    
    router.use('/v0', v0Router);
    
    return router;
}

/**
 * 获取公开的版本信息（用于 API 文档）
 * @returns {Object} 公开的版本信息
 */
function getPublicVersionInfo() {
    return {
        current: {
            version: '1.0.0',
            status: 'stable',
            releaseDate: '2026-02-24',
            path: '/v1'
        },
        deprecated: [{
            version: '0.9.0',
            status: 'deprecated',
            sunsetDate: '2026-06-01',
            path: '/v0',
            migrationGuide: 'https://docs.hjs.sh/migration'
        }],
        changelog: {
            '1.0.0': [
                'Stable release',
                'Full support for Judgment, Delegation, Termination, Verification',
                'OpenTimestamps anchoring'
            ],
            '0.9.0': [
                'Initial beta release',
                'Basic judgment recording'
            ]
        }
    };
}

module.exports = {
    versionNegotiation,
    createVersionRouter,
    getPublicVersionInfo
};

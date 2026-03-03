// ========== HJS Global Language Resolution Layer ==========
// HJS 全局语言解析层
//
// 解析顺序（确定性）：
//   1. URL 参数 ?lang= （最高优先级）
//   2. localStorage 中保存的偏好
//   3. 浏览器系统语言
//   4. 协议默认语言 (en)
//
// 功能：
//   - 自动检测并应用语言
//   - 同步语言偏好到 localStorage
//   - 同步语言到 URL 参数
//   - 支持动态切换语言
//
// 使用方式：
//   1. 页面加载时自动执行
//   2. 可通过 window.HJSLang.setLang('zh') 手动切换
//   3. 语言切换控件绑定 window.switchLang 函数

(function() {
    const CONFIG = {
        DEFAULT_LANG: 'en',           // 默认语言
        STORAGE_KEY: 'hjs_lang',       // localStorage 存储键名
        SUPPORTED_LANGS: ['en', 'zh']  // 支持的语言列表
    };

    /**
     * 获取浏览器系统语言
     * @returns {string} 语言代码 ('en' 或 'zh')
     */
    function getBrowserLang() {
        const navLang = navigator.language || navigator.userLanguage;
        if (navLang.startsWith('zh')) return 'zh';
        return CONFIG.DEFAULT_LANG;
    }

    /**
     * 从 URL 参数获取语言
     * @returns {string|null} 语言代码或 null
     */
    function getLangFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const lang = params.get('lang');
        return CONFIG.SUPPORTED_LANGS.includes(lang) ? lang : null;
    }

    /**
     * 从 localStorage 获取保存的语言偏好
     * @returns {string|null} 语言代码或 null
     */
    function getLangFromStorage() {
        const lang = localStorage.getItem(CONFIG.STORAGE_KEY);
        return CONFIG.SUPPORTED_LANGS.includes(lang) ? lang : null;
    }

    /**
     * 解析最终使用的语言（按优先级）
     * @returns {string} 语言代码
     */
    function resolveLang() {
        return getLangFromUrl() || getLangFromStorage() || getBrowserLang();
    }

    /**
     * 保存语言偏好到 localStorage
     * @param {string} lang - 语言代码
     */
    function persistLang(lang) {
        if (CONFIG.SUPPORTED_LANGS.includes(lang)) {
            localStorage.setItem(CONFIG.STORAGE_KEY, lang);
        }
    }

    /**
     * 同步语言到 URL 参数
     * @param {string} lang - 语言代码
     */
    function syncUrl(lang) {
        const url = new URL(window.location);
        if (url.searchParams.get('lang') !== lang) {
            url.searchParams.set('lang', lang);
            window.history.replaceState({}, '', url);
        }
    }

    /**
     * 应用语言到页面
     * @param {string} lang - 语言代码
     */
    function applyLang(lang) {
        // 调用全局切换函数（如果存在）
        if (typeof window.switchLang === 'function') {
            window.switchLang(lang);
        }
        
        // 更新所有语言选择下拉框
        document.querySelectorAll('select[onchange*="switchLang"]').forEach(select => {
            select.value = lang;
        });

        // 设置 html 标签的 lang 属性
        document.documentElement.lang = lang;
    }

    // ========== 初始化执行 ==========
    const currentLang = resolveLang();
    persistLang(currentLang);
    syncUrl(currentLang);
    applyLang(currentLang);

    // 输出调试信息
    console.log(`[HJS] Language resolved: ${currentLang}`);
    console.log(`[HJS]   └─ URL: ${getLangFromUrl() || 'not set'}`);
    console.log(`[HJS]   └─ Storage: ${getLangFromStorage() || 'not set'}`);
    console.log(`[HJS]   └─ Browser: ${getBrowserLang()}`);

    // ========== 暴露 API ==========
    window.HJSLang = {
        /**
         * 获取当前语言
         * @returns {string} 当前语言代码
         */
        getCurrent: () => currentLang,

        /**
         * 手动切换语言
         * @param {string} lang - 目标语言代码
         */
        setLang: (lang) => {
            if (!CONFIG.SUPPORTED_LANGS.includes(lang)) {
                console.warn(`[HJS] Unsupported language: ${lang}`);
                return;
            }
            
            // 保存偏好并刷新页面
            localStorage.setItem(CONFIG.STORAGE_KEY, lang);
            window.location.search = `?lang=${lang}`;
        },

        /**
         * 重新解析语言（不刷新页面）
         */
        reparse: () => {
            const newLang = resolveLang();
            if (newLang !== currentLang) {
                applyLang(newLang);
                persistLang(newLang);
                syncUrl(newLang);
                console.log(`[HJS] Language updated to: ${newLang}`);
            }
        },

        /**
         * 获取支持的语言列表
         * @returns {string[]} 支持的语言代码数组
         */
        getSupported: () => [...CONFIG.SUPPORTED_LANGS]
    };

    // 兼容旧的 switchLang 函数
    window.switchLang = window.switchLang || window.HJSLang.setLang;
})();

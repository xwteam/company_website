/**
 * 管理面板模块加载器
 * 负责动态加载所有必需的模块
 */

class AdminModuleLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadingPromises = new Map();
        this.basePath = this.detectBasePath();
    }

    // 自动检测基础路径
    detectBasePath() {
        const currentScript = document.currentScript;
        if (currentScript) {
            const scriptPath = currentScript.src;
            if (scriptPath.includes('/admin/')) {
                // 从admin目录调用，需要返回上级目录
                return '../';
            }
        }
        // 从根目录调用
        return '';
    }

    // 解析相对路径
    resolvePath(path) {
        if (path.startsWith('js/admin/')) {
            return this.basePath + path;
        }
        if (path.startsWith('js/')) {
            return this.basePath + path;
        }
        return path;
    }

    // 加载JavaScript模块
    async loadScript(src) {
        const resolvedSrc = this.resolvePath(src);
        
        if (this.loadedModules.has(resolvedSrc)) {
            return Promise.resolve();
        }

        if (this.loadingPromises.has(resolvedSrc)) {
            return this.loadingPromises.get(resolvedSrc);
        }

        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = resolvedSrc;
            script.onload = () => {
                this.loadedModules.add(resolvedSrc);
                resolve();
            };
            script.onerror = () => reject(new Error(`Failed to load script: ${resolvedSrc}`));
            document.head.appendChild(script);
        });

        this.loadingPromises.set(resolvedSrc, promise);
        return promise;
    }

    // 加载CSS文件
    async loadStyle(href) {
        if (this.loadedModules.has(href)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => {
                this.loadedModules.add(href);
                resolve();
            };
            link.onerror = () => reject(new Error(`Failed to load style: ${href}`));
            document.head.appendChild(link);
        });
    }

    // 加载HTML组件
    async loadComponent(containerId, componentPath) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentPath}`);
            }
            const html = await response.text();
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = html;
            }
            return html;
        } catch (error) {
            console.error('Component loading error:', error);
            return null;
        }
    }

    // 初始化管理面板
    async initializeAdmin() {
        try {
            console.log('🚀 正在初始化管理面板模块...');

            // 1. 加载核心模块
            await this.loadScript('js/admin/core.js');
            console.log('✅ 核心模块加载完成');

            // 2. 加载工具模块
            await Promise.all([
                this.loadScript('js/admin/utils/helpers.js'),
                this.loadScript('js/admin/utils/handlers.js'),
                this.loadScript('js/admin/utils/dynamic-add.js')
            ]);
            console.log('✅ 工具模块加载完成');

            // 3. 加载表单生成器
            await Promise.all([
                this.loadScript('js/admin/form-generators/index-form.js'),
                this.loadScript('js/admin/form-generators/products-form.js')
                // 可以继续添加其他表单生成器
            ]);
            console.log('✅ 表单生成器加载完成');

            // 4. 加载配置管理库
            await this.loadScript('js/config-fallback.js');
            console.log('✅ 配置管理库加载完成');

            // 5. 触发初始化完成事件
            document.dispatchEvent(new CustomEvent('adminModulesLoaded'));
            console.log('🎉 管理面板模块初始化完成！');

            return true;
        } catch (error) {
            console.error('❌ 管理面板初始化失败:', error);
            return false;
        }
    }

    // 获取已加载的模块列表
    getLoadedModules() {
        return Array.from(this.loadedModules);
    }
}

// 创建全局实例
window.adminModuleLoader = new AdminModuleLoader();

// 自动初始化
document.addEventListener('DOMContentLoaded', async () => {
    const success = await window.adminModuleLoader.initializeAdmin();
    if (success) {
        console.log('📱 管理面板就绪，可以使用所有功能');
    } else {
        console.error('💥 管理面板初始化失败，某些功能可能不可用');
    }
});
/**
 * 安全的配置管理客户端库
 * 支持KV存储优先加载，降级到本地JSON文件
 * 不暴露敏感信息到客户端代码
 */

class SecureConfigManager {
    constructor() {
        this.baseUrl = this.getBaseUrl();
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
        this.credentials = null; // 用户凭据通过管理界面设置，不在代码中硬编码
    }

    // 获取当前域名的API基础URL
    getBaseUrl() {
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return '';
    }

    // 设置登录凭据（仅管理员使用）
    setCredentials(username, password) {
        const encoded = btoa(`${username}:${password}`);
        this.credentials = {
            username: username,
            authHeader: `Basic ${encoded}`
        };
        
        // 存储到sessionStorage，页面关闭后自动清除
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('admin_credentials', JSON.stringify({
                username: username,
                authHeader: `Basic ${encoded}`
            }));
        }
    }

    // 获取认证头
    getAuthHeader() {
        if (this.credentials) return this.credentials.authHeader;
        
        if (typeof window !== 'undefined') {
            const stored = window.sessionStorage.getItem('admin_credentials');
            if (stored) {
                const credentials = JSON.parse(stored);
                this.credentials = credentials;
                return credentials.authHeader;
            }
        }
        return null;
    }

    // 获取用户名
    getUsername() {
        if (this.credentials) return this.credentials.username;
        
        if (typeof window !== 'undefined') {
            const stored = window.sessionStorage.getItem('admin_credentials');
            if (stored) {
                const credentials = JSON.parse(stored);
                return credentials.username;
            }
        }
        return null;
    }

    // 清除登录凭据
    clearCredentials() {
        this.credentials = null;
        if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem('admin_credentials');
        }
    }

    // 兼容旧的API密钥方法
    setApiKey(key) {
        // 将API密钥转换为用户名密码格式（向后兼容）
        this.setCredentials('api_key', key);
    }

    getApiKey() {
        return this.getAuthHeader();
    }

    clearApiKey() {
        this.clearCredentials();
    }

    // 读取配置（KV优先，降级到JSON文件）
    async getConfig(configKey) {
        try {
            // 检查缓存
            const cacheKey = `config-${configKey}`;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            let config = null;

            // 1. 尝试从KV存储读取（需要登录凭据）
            if (this.getAuthHeader()) {
                try {
                    config = await this.getConfigFromKV(configKey);
                    if (config) {
                        this.cacheConfig(configKey, config);
                        return config;
                    }
                } catch (error) {
                    console.warn(`KV读取失败，降级到JSON文件: ${error.message}`);
                }
            }

            // 2. 降级到本地JSON文件
            try {
                config = await this.getConfigFromJSON(configKey);
                if (config) {
                    this.cacheConfig(configKey, config);
                    return config;
                }
            } catch (error) {
                console.error(`JSON文件读取失败: ${error.message}`);
            }

            throw new Error(`无法加载配置文件: ${configKey}`);

        } catch (error) {
            console.error('配置加载失败:', error);
            throw error;
        }
    }

    // 从KV存储读取配置
    async getConfigFromKV(configKey) {
        const response = await fetch(`${this.baseUrl}/api/config/${configKey}`, {
            method: 'GET',
            headers: {
                'Authorization': this.getAuthHeader(),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('用户名或密码无效');
            }
            throw new Error(`KV API错误: ${response.status}`);
        }

        const result = await response.json();
        return result.success ? result.data : null;
    }

    // 从本地JSON文件读取配置
    async getConfigFromJSON(configKey) {
        const response = await fetch(`config/${configKey}.json`);
        if (!response.ok) {
            throw new Error(`JSON文件不存在: ${response.status}`);
        }
        return await response.json();
    }

    // 保存配置到KV存储（仅管理员）
    async saveConfig(configKey, configData, syncToGitee = true) {
        const authHeader = this.getAuthHeader();
        if (!authHeader) {
            throw new Error('需要管理员权限，请先登录');
        }

        const response = await fetch(`${this.baseUrl}/api/config/${configKey}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(configData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('用户名或密码无效');
            }
            throw new Error(`保存失败: ${response.status}`);
        }

        const result = await response.json();
        
        // 更新本地缓存
        this.cacheConfig(configKey, configData);
        
        return result;
    }

    // 删除配置
    async deleteConfig(configKey) {
        const authHeader = this.getAuthHeader();
        if (!authHeader) {
            throw new Error('需要管理员权限，请先登录');
        }

        const response = await fetch(`${this.baseUrl}/api/config/${configKey}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`删除失败: ${response.status}`);
        }

        // 清除本地缓存
        this.cache.delete(`config-${configKey}`);
        
        return await response.json();
    }

    // 列出所有配置
    async listConfigs() {
        const authHeader = this.getAuthHeader();
        if (!authHeader) {
            throw new Error('需要管理员权限，请先登录');
        }

        const response = await fetch(`${this.baseUrl}/api/config/list`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`获取配置列表失败: ${response.status}`);
        }

        return await response.json();
    }

    // 同步所有配置到Gitee
    async syncToGitee() {
        const authHeader = this.getAuthHeader();
        if (!authHeader) {
            throw new Error('需要管理员权限，请先登录');
        }

        const response = await fetch(`${this.baseUrl}/api/config/sync`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`同步失败: ${response.status}`);
        }

        return await response.json();
    }

    // 缓存配置
    cacheConfig(configKey, config) {
        this.cache.set(`config-${configKey}`, {
            data: config,
            timestamp: Date.now()
        });
    }

    // 清除缓存
    clearCache() {
        this.cache.clear();
    }

    // 验证用户名密码是否有效
    async validateCredentials(username, password) {
        try {
            const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
            const response = await fetch(`${this.baseUrl}/api/config/list`, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // 兼容旧的API密钥验证
    async validateApiKey(apiKey) {
        return await this.validateCredentials('api_key', apiKey);
    }
}

// 全局配置管理实例
window.configManager = new SecureConfigManager();

// 兼容性函数，供现有页面使用
window.loadConfig = async function(configKey) {
    try {
        return await window.configManager.getConfig(configKey);
    } catch (error) {
        console.error(`加载配置失败: ${configKey}`, error);
        throw error;
    }
};

// 管理员函数
window.adminConfig = {
    // 新的用户名密码登录
    login: (username, password) => window.configManager.setCredentials(username, password),
    logout: () => window.configManager.clearCredentials(),
    getUsername: () => window.configManager.getUsername(),
    validateCredentials: (username, password) => window.configManager.validateCredentials(username, password),
    
    // 配置操作
    getConfig: (key) => window.configManager.getConfig(key),
    saveConfig: (key, data) => window.configManager.saveConfig(key, data),
    deleteConfig: (key) => window.configManager.deleteConfig(key),
    listConfigs: () => window.configManager.listConfigs(),
    syncToGitee: () => window.configManager.syncToGitee(),
    clearCache: () => window.configManager.clearCache(),
    
    // 兼容旧接口
    setApiKey: (key) => window.configManager.setCredentials('api_key', key),
    validateApiKey: (key) => window.configManager.validateApiKey(key)
};
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
        this.apiKey = null; // API密钥通过管理界面设置，不在代码中硬编码
    }

    // 获取当前域名的API基础URL
    getBaseUrl() {
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return '';
    }

    // 设置API密钥（仅管理员使用）
    setApiKey(key) {
        this.apiKey = key;
        // 存储到sessionStorage，页面关闭后自动清除
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('admin_api_key', key);
        }
    }

    // 获取API密钥
    getApiKey() {
        if (this.apiKey) return this.apiKey;
        
        if (typeof window !== 'undefined') {
            return window.sessionStorage.getItem('admin_api_key');
        }
        return null;
    }

    // 清除API密钥
    clearApiKey() {
        this.apiKey = null;
        if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem('admin_api_key');
        }
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

            // 1. 尝试从KV存储读取（需要API密钥）
            if (this.getApiKey()) {
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
                'X-API-Key': this.getApiKey(),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('API密钥无效或已过期');
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
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('需要管理员权限');
        }

        const response = await fetch(`${this.baseUrl}/api/config/${configKey}`, {
            method: 'PUT',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(configData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('API密钥无效或已过期');
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
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('需要管理员权限');
        }

        const response = await fetch(`${this.baseUrl}/api/config/${configKey}`, {
            method: 'DELETE',
            headers: {
                'X-API-Key': apiKey,
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
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('需要管理员权限');
        }

        const response = await fetch(`${this.baseUrl}/api/config/list`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
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
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('需要管理员权限');
        }

        const response = await fetch(`${this.baseUrl}/api/config/sync`, {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
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

    // 验证API密钥是否有效
    async validateApiKey(apiKey) {
        try {
            const response = await fetch(`${this.baseUrl}/api/config/list`, {
                method: 'GET',
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
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
    setApiKey: (key) => window.configManager.setApiKey(key),
    getConfig: (key) => window.configManager.getConfig(key),
    saveConfig: (key, data) => window.configManager.saveConfig(key, data),
    deleteConfig: (key) => window.configManager.deleteConfig(key),
    listConfigs: () => window.configManager.listConfigs(),
    syncToGitee: () => window.configManager.syncToGitee(),
    clearCache: () => window.configManager.clearCache(),
    validateApiKey: (key) => window.configManager.validateApiKey(key)
};
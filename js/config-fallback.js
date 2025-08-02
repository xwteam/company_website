/**
 * 配置加载降级处理库
 * 当API不可用时自动降级到JSON文件
 */

// 紧急降级配置管理器
class FallbackConfigManager {
    constructor() {
        this.baseUrl = window.location.origin;
        this.fallbackMode = false;
    }

    // 检测API是否可用
    async checkApiAvailability() {
        try {
            const response = await fetch(`${this.baseUrl}/api/test`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const text = await response.text();
            
            // 检查是否返回HTML（说明API路由失败）
            if (text.trim().startsWith('<')) {
                console.warn('API返回HTML，Functions可能未正确部署');
                return false;
            }
            
            // 尝试解析JSON
            try {
                JSON.parse(text);
                return response.ok;
            } catch (e) {
                console.warn('API返回非JSON格式数据');
                return false;
            }
        } catch (error) {
            console.warn('API连接失败:', error.message);
            return false;
        }
    }

    // 从JSON文件加载配置（降级方案）
    async loadFromJSON(configKey) {
        try {
            const response = await fetch(`config/${configKey}.json`);
            if (!response.ok) {
                throw new Error(`JSON文件加载失败: ${response.status}`);
            }
            const config = await response.json();
            console.log(`✅ 从JSON文件加载配置: ${configKey}`);
            return config;
        } catch (error) {
            console.error(`❌ JSON文件加载失败: ${configKey}`, error);
            throw error;
        }
    }

    // 尝试从API加载配置
    async loadFromAPI(configKey, credentials) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (credentials) {
                headers['Authorization'] = credentials;
            }
            
            const response = await fetch(`${this.baseUrl}/api/config/${configKey}`, {
                method: 'GET',
                headers: headers
            });

            const text = await response.text();
            console.log(`🔍 API响应 (${configKey}):`, text);
            
            // 检查是否返回HTML
            if (text.trim().startsWith('<')) {
                throw new Error('API返回HTML页面，可能Functions未部署');
            }
            
            // 检查是否为空响应
            if (!text.trim()) {
                throw new Error('API返回空响应');
            }
            
            let result;
            try {
                result = JSON.parse(text);
            } catch (parseError) {
                console.error('JSON解析失败:', parseError);
                console.error('原始响应:', text);
                throw new Error(`JSON解析失败: ${parseError.message}`);
            }
            
            if (result.success && result.data) {
                console.log(`✅ 从KV存储加载配置: ${configKey}`);
                return result.data;
            } else {
                throw new Error(result.message || 'KV存储中无数据');
            }
        } catch (error) {
            console.warn(`⚠️ API加载失败: ${configKey}`, error.message);
            throw error;
        }
    }

    // 智能配置加载（API优先，自动降级）
    async loadConfig(configKey, credentials = null) {
        try {
            // 如果已知API不可用，直接使用JSON
            if (this.fallbackMode) {
                return await this.loadFromJSON(configKey);
            }
            
            // 尝试从API加载
            try {
                return await this.loadFromAPI(configKey, credentials);
            } catch (apiError) {
                // API失败，切换到降级模式
                console.warn(`🔄 API失败，切换到JSON模式: ${apiError.message}`);
                this.fallbackMode = true;
                return await this.loadFromJSON(configKey);
            }
        } catch (error) {
            console.error(`❌ 配置加载完全失败: ${configKey}`, error);
            throw new Error(`无法加载配置文件 ${configKey}: ${error.message}`);
        }
    }

    // 管理员专用：获取配置（带认证）
    async getConfig(configKey, credentials) {
        try {
            // 使用API加载配置（管理员功能）
            return await this.loadFromAPI(configKey, credentials);
        } catch (error) {
            console.error(`❌ 管理员配置加载失败: ${configKey}`, error);
            
            // 如果是KV存储中无数据，尝试从JSON文件加载作为初始值
            if (error.message.includes('KV存储中无数据') || error.message.includes('Config not found')) {
                console.log(`🔄 KV存储中无 ${configKey}，尝试从JSON文件加载作为初始值...`);
                try {
                    const jsonData = await this.loadFromJSON(configKey);
                    console.log(`✅ 从JSON文件加载初始配置: ${configKey}`);
                    
                    // 可选：将JSON数据保存到KV存储
                    if (credentials) {
                        console.log(`💾 将初始配置保存到KV存储: ${configKey}`);
                        await this.saveConfig(configKey, jsonData, credentials);
                    }
                    
                    return jsonData;
                } catch (jsonError) {
                    console.error(`❌ JSON文件也加载失败: ${configKey}`, jsonError);
                    throw new Error(`无法加载配置文件 ${configKey}: API和JSON都失败`);
                }
            }
            
            throw new Error(`无法加载配置文件 ${configKey}: ${error.message}`);
        }
    }

    // 管理员功能（带认证）
    async adminListConfigs(credentials) {
        try {
            const response = await fetch(`${this.baseUrl}/api/configs`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': credentials
                }
            });

            const text = await response.text();
            
            if (text.trim().startsWith('<')) {
                throw new Error('API返回HTML页面，Functions可能未正确部署');
            }
            
            const result = JSON.parse(text);
            return result;
        } catch (error) {
            console.error('管理员API调用失败:', error);
            throw error;
        }
    }

    // 验证用户凭据（安全版本）
    async validateCredentials(username, password) {
        // 首先检查API是否可用
        const apiAvailable = await this.checkApiAvailability();
        if (!apiAvailable) {
            console.warn('⚠️ API不可用，验证功能受限');
            // API不可用时，拒绝验证（安全策略）
            throw new Error('服务器连接失败，无法验证身份');
        }

        try {
            const credentials = `Basic ${btoa(`${username}:${password}`)}`;
            const result = await this.adminListConfigs(credentials);
            return result.success === true;
        } catch (error) {
            console.error('⚠️ API验证失败:', error.message);
            // API验证失败时，返回false而不是降级
            return false;
        }
    }

    // 保存配置
    async saveConfig(configKey, configData, credentials) {
        try {
            const response = await fetch(`${this.baseUrl}/api/config/${configKey}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': credentials
                },
                body: JSON.stringify(configData)
            });

            const text = await response.text();
            
            if (text.trim().startsWith('<')) {
                throw new Error('API返回HTML页面，Functions可能未正确部署');
            }
            
            const result = JSON.parse(text);
            return result;
        } catch (error) {
            console.error('保存配置失败:', error);
            throw error;
        }
    }
}

// 创建全局实例
window.fallbackConfigManager = new FallbackConfigManager();

// 重写原有的配置加载函数，增加降级支持
window.loadConfig = async function(configKey) {
    try {
        return await window.fallbackConfigManager.loadConfig(configKey);
    } catch (error) {
        console.error(`加载配置失败: ${configKey}`, error);
        
        // 显示用户友好的错误信息
        const errorMsg = `配置加载失败: ${configKey}\n原因: ${error.message}\n\n请检查：\n1. 网络连接是否正常\n2. EdgeOne Functions是否已部署\n3. 配置文件是否存在`;
        
        if (typeof showError === 'function') {
            showError(errorMsg);
        } else {
            alert(errorMsg);
        }
        
        throw error;
    }
};

// 增强的管理员功能
window.enhancedAdminConfig = {
    async validateCredentials(username, password) {
        return await window.fallbackConfigManager.validateCredentials(username, password);
    },
    
    async getConfig(configKey, credentials) {
        return await window.fallbackConfigManager.getConfig(configKey, credentials);
    },
    
    async listConfigs(credentials) {
        return await window.fallbackConfigManager.adminListConfigs(credentials);
    },
    
    async saveConfig(configKey, configData, credentials) {
        return await window.fallbackConfigManager.saveConfig(configKey, configData, credentials);
    },
    
    async checkApiStatus() {
        return await window.fallbackConfigManager.checkApiAvailability();
    },
    
    getFallbackMode() {
        return window.fallbackConfigManager.fallbackMode;
    }
};

// 页面加载时检查API状态
document.addEventListener('DOMContentLoaded', async function() {
    const apiAvailable = await window.fallbackConfigManager.checkApiAvailability();
    
    if (!apiAvailable) {
        console.warn('⚠️ API不可用，网站将使用JSON文件模式运行');
        window.fallbackConfigManager.fallbackMode = true;
        
        // 可选：显示提示给管理员
        if (window.location.pathname.includes('admin')) {
            console.warn('🔧 管理功能可能受限，请检查EdgeOne Functions部署状态');
        }
    } else {
        console.log('✅ API连接正常');
    }
});
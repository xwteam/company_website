// 初始化KV存储
(function() {
    // 创建KV存储API客户端
    window.stella = {
        // 标记为API客户端模式
        isApiClient: true,
        isMock: false,
        
        // 通过API获取键值
        async get(key, type) {
            console.log(`KV存储API: 获取键 "${key}" (类型: ${type})`);
            try {
                const response = await fetch(`/api/kv/${key}`, {
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`KV存储API: 获取键 "${key}" 成功:`, data);
                    
                    let value = data.value;
                    
                    // 根据请求的类型处理值
                    if (type === 'json' && typeof value === 'string') {
                        try {
                            return JSON.parse(value);
                        } catch (error) {
                            console.error(`KV存储API: 解析JSON失败:`, error);
                            return null;
                        }
                    }
                    
                    return value;
                } else {
                    throw new Error(`API返回错误: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error(`KV存储API: 获取键 "${key}" 失败:`, error);
                
                // 如果API失败，回退到默认值
                return this._getDefaultValue(key, type);
            }
        },
        
        // 通过API设置键值
        async put(key, value) {
            console.log(`KV存储API: 设置键 "${key}" 的值为:`, value);
            try {
                const response = await fetch(`/api/kv/${key}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ value })
                });
                
                if (response.ok) {
                    console.log(`KV存储API: 设置键 "${key}" 成功`);
                    return true;
                } else {
                    throw new Error(`API返回错误: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error(`KV存储API: 设置键 "${key}" 失败:`, error);
                
                // 如果API失败，保存到localStorage作为备份
                this._saveToLocalStorage(key, value);
                return false;
            }
        },
        
        // 通过API删除键
        async delete(key) {
            console.log(`KV存储API: 删除键 "${key}"`);
            try {
                const response = await fetch(`/api/kv/${key}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    console.log(`KV存储API: 删除键 "${key}" 成功`);
                    return true;
                } else {
                    throw new Error(`API返回错误: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error(`KV存储API: 删除键 "${key}" 失败:`, error);
                return false;
            }
        },
        
        // 通过API列出所有键
        async list(options) {
            console.log('KV存储API: 列出所有键');
            try {
                const response = await fetch('/api/kv');
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('KV存储API: 列出键成功:', data);
                    return data;
                } else {
                    throw new Error(`API返回错误: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error('KV存储API: 列出键失败:', error);
                return { keys: [], list_complete: true, cursor: '' };
            }
        },
        
        // 保存到localStorage作为备份
        _saveToLocalStorage(key, value) {
            try {
                let storage = {};
                const savedData = localStorage.getItem('stella_kv_storage');
                if (savedData) {
                    storage = JSON.parse(savedData);
                }
                
                storage[key] = value;
                localStorage.setItem('stella_kv_storage', JSON.stringify(storage));
                console.log(`已保存键 "${key}" 到localStorage作为备份`);
            } catch (error) {
                console.error('保存到localStorage失败:', error);
            }
        },
        
        // 获取默认值
        _getDefaultValue(key, type) {
            // 尝试从localStorage获取
            try {
                const savedData = localStorage.getItem('stella_kv_storage');
                if (savedData) {
                    const storage = JSON.parse(savedData);
                    if (storage[key] !== undefined) {
                        console.log(`从localStorage获取键 "${key}" 的值:`, storage[key]);
                        
                        if (type === 'json' && typeof storage[key] === 'string') {
                            try {
                                return JSON.parse(storage[key]);
                            } catch (error) {
                                console.error(`解析JSON失败:`, error);
                            }
                        }
                        
                        return storage[key];
                    }
                }
            } catch (error) {
                console.error('从localStorage获取数据失败:', error);
            }
            
            // 默认值
            const defaultConfig = {
                'hero-bg': 'images/hero-bg.jpg',
                'hero-content-title': 'Crafting digital<br>experiences with purpose',
                'hero-content-description': 'Strategy-driven design and technology for forward-thinking brands',
                'services-description': {
                    'title': 'We combine strategy, design, and technology to create effective digital solutions',
                    'items': [
                        {
                            'id': '01',
                            'icon': 'fas fa-globe',
                            'title': 'Brand Identity',
                            'desc': 'We create unique visual systems that embody your brand values'
                        },
                        // ... 其他服务项目 ...
                    ]
                },
                'featured-products-description': 'A selection of our quality products across categories',
                'testimonials-description': {
                    'title': 'Hear from the businesses we have helped transform',
                    'items': [
                        // ... 客户评价项目 ...
                    ]
                }
            };
            
            const value = defaultConfig[key];
            console.log(`返回默认值:`, value);
            
            if (type === 'json' && value) {
                return value;
            } else if (type === 'text' && value) {
                return typeof value === 'string' ? value : JSON.stringify(value);
            }
            
            return value;
        }
    };
    
    // 检查API是否可用
    (async function() {
        try {
            const response = await fetch('/api/kv/test', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ value: 'API测试' })
            });
            
            if (response.ok) {
                console.log('✅ KV存储API可用');
            } else {
                console.warn('⚠️ KV存储API返回错误:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('❌ KV存储API不可用:', error);
        }
    })();
})();
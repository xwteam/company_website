/**
 * EdgeOne KV存储初始化脚本
 * 命名空间名称: stella
 * 命名空间ID: ns-ctd2RL3uTaAj
 */

// 初始化KV存储
(function() {
    // 检查是否在EdgeOne Pages环境中
    if (typeof EdgeOne === 'undefined' || !EdgeOne.env || !EdgeOne.env.stella) {
        console.error('KV存储初始化失败: EdgeOne.env.stella命名空间未定义，请确保在EdgeOne Pages环境中运行');
        
        // 创建一个模拟的KV存储API，用于本地开发测试
        window.stella = {
            // 存储数据的内部对象
            _storage: {},
            
            // 初始化本地存储
            _init() {
                // 尝试从localStorage加载数据
                try {
                    const savedData = localStorage.getItem('stella_kv_storage');
                    if (savedData) {
                        this._storage = JSON.parse(savedData);
                        console.log('已从localStorage加载KV存储数据:', this._storage);
                    }
                } catch (error) {
                    console.error('从localStorage加载KV存储数据失败:', error);
                }
            },
            
            // 保存数据到localStorage
            _save() {
                try {
                    localStorage.setItem('stella_kv_storage', JSON.stringify(this._storage));
                    console.log('已保存KV存储数据到localStorage');
                } catch (error) {
                    console.error('保存KV存储数据到localStorage失败:', error);
                }
            },
            
            async get(key, type) {
                console.warn(`KV存储模拟: 获取键 "${key}" (类型: ${type})`);
                
                try {
                    // 尝试从API获取数据
                    const response = await fetch(`/api/kv/${key}`);
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
                    }
                } catch (error) {
                    console.warn(`KV存储API: 获取键 "${key}" 失败:`, error);
                }
                
                // 如果API失败，回退到本地存储
                if (this._storage[key]) {
                    const value = this._storage[key];
                    console.log(`KV存储模拟: 从本地存储获取键 "${key}" 的值:`, value);
                    
                    if (type === 'json' && typeof value === 'string') {
                        try {
                            return JSON.parse(value);
                        } catch (error) {
                            console.error(`KV存储模拟: 解析JSON失败:`, error);
                        }
                    }
                    
                    return value;
                }
                
                // 返回默认值
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
                            {
                                'id': '02',
                                'icon': 'fas fa-laptop-code',
                                'title': 'Web Development',
                                'desc': 'Custom website solutions built with cutting-edge technology'
                            },
                            {
                                'id': '03',
                                'icon': 'fas fa-pencil-ruler',
                                'title': 'UX Design',
                                'desc': 'Human-centered design that creates intuitive experiences'
                            },
                            {
                                'id': '04',
                                'icon': 'fas fa-chart-line',
                                'title': 'Digital Marketing',
                                'desc': 'Data-driven strategies to increase your visibility'
                            }
                        ]
                    },
                    'featured-products-description': 'A selection of our quality products across categories',
                    'testimonials-description': {
                        'title': 'Hear from the businesses we have helped transform',
                        'items': [
                            {
                                'id': '01',
                                'quote': 'Brand helped us completely reimagine our digital presence.',
                                'name': 'Sarah Johnson',
                                'position': 'Marketing Director, TechNova',
                                'avatar': 'https://randomuser.me/api/portraits/women/45.jpg'
                            },
                            {
                                'id': '02',
                                'quote': 'Working with Brand was a game-changer for our company.',
                                'name': 'Michael Chen',
                                'position': 'CEO, GreenEarth Solutions',
                                'avatar': 'https://randomuser.me/api/portraits/men/32.jpg'
                            },
                            {
                                'id': '03',
                                'quote': 'The team at Brand brings both creativity and strategic thinking.',
                                'name': 'Jessica Williams',
                                'position': 'Operations Manager, Urban Dwellers',
                                'avatar': 'https://randomuser.me/api/portraits/women/26.jpg'
                            }
                        ]
                    }
                };
                
                // 根据请求的键返回相应的值
                const value = defaultConfig[key];
                console.log(`KV存储模拟: 返回默认值:`, value);
                
                // 根据请求的类型返回值
                if (type === 'json' && value) {
                    return value;
                } else if (type === 'text' && value) {
                    return typeof value === 'string' ? value : JSON.stringify(value);
                }
                
                return value;
            },
            
            async put(key, value) {
                console.warn(`KV存储模拟: 设置键 "${key}" 的值为:`, value);
                
                try {
                    // 尝试通过API设置值
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
                    }
                } catch (error) {
                    console.warn(`KV存储API: 设置键 "${key}" 失败:`, error);
                }
                
                // 如果API失败，保存到本地存储
                this._storage[key] = value;
                this._save();
                
                return true;
            },
            
            async delete(key) {
                console.warn(`KV存储模拟: 删除键 "${key}"`);
                
                try {
                    // 尝试通过API删除值
                    const response = await fetch(`/api/kv/${key}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        console.log(`KV存储API: 删除键 "${key}" 成功`);
                        return true;
                    }
                } catch (error) {
                    console.warn(`KV存储API: 删除键 "${key}" 失败:`, error);
                }
                
                // 如果API失败，从本地存储中删除
                delete this._storage[key];
                this._save();
                
                return true;
            },
            
            async list(options) {
                console.warn('KV存储模拟: 列出键', options);
                
                try {
                    // 尝试通过API获取键列表
                    const response = await fetch('/api/kv');
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('KV存储API: 列出键成功:', data);
                        return data;
                    }
                } catch (error) {
                    console.warn('KV存储API: 列出键失败:', error);
                }
                
                // 返回本地存储中的所有键
                const keys = Object.keys(this._storage).map(key => ({ name: key }));
                
                return {
                    keys: keys,
                    list_complete: true,
                    cursor: ''
                };
            },
            
            // 添加toString方法，用于标识模拟对象
            toString() {
                return '[对象 模拟KV存储API]';
            }
        };
        
        // 初始化本地存储
        window.stella._init();
        
        // 添加一个标识，表示这是模拟对象
        window.stella.isMock = true;
        
    } else {
        console.log('KV存储初始化成功: EdgeOne.env.stella命名空间已加载');
        
        // 使用EdgeOne.env.stella作为KV存储对象
        window.stella = EdgeOne.env.stella;
        
        // 添加一个标识，表示这是真实对象
        window.stella.isMock = false;
        
        // 包装原始方法，添加日志
        const originalGet = window.stella.get;
        window.stella.get = async function(key, type) {
            console.log(`KV存储: 获取键 "${key}" (类型: ${type})`);
            try {
                const result = await originalGet.apply(this, arguments);
                console.log(`KV存储: 获取键 "${key}" 成功:`, result);
                return result;
            } catch (error) {
                console.error(`KV存储: 获取键 "${key}" 失败:`, error);
                throw error;
            }
        };
        
        const originalPut = window.stella.put;
        window.stella.put = async function(key, value) {
            console.log(`KV存储: 设置键 "${key}" 的值为:`, value);
            try {
                const result = await originalPut.apply(this, arguments);
                console.log(`KV存储: 设置键 "${key}" 成功`);
                return result;
            } catch (error) {
                console.error(`KV存储: 设置键 "${key}" 失败:`, error);
                throw error;
            }
        };
    }
})();

// 导出一个函数，用于将配置数据初始化到KV存储中
async function initializeKVWithConfig(config) {
    try {
        // 检查stella是否已定义
        if (typeof stella === 'undefined') {
            throw new Error('stella命名空间未定义');
        }
        
        console.log('开始初始化KV存储...');
        console.log('配置数据:', config);
        
        // 存储hero背景
        await stella.put('hero-bg', config['hero-bg']);
        console.log('已存储hero背景');
        
        // 存储hero标题
        await stella.put('hero-content-title', config['hero-content-title']);
        console.log('已存储hero标题');
        
        // 存储hero描述
        await stella.put('hero-content-description', config['hero-content-description']);
        console.log('已存储hero描述');
        
        // 存储服务描述
        const servicesJson = JSON.stringify(config['services-description']);
        console.log('服务描述JSON:', servicesJson);
        await stella.put('services-description', servicesJson);
        console.log('已存储服务描述');
        
        // 存储精选产品描述
        await stella.put('featured-products-description', config['featured-products-description']);
        console.log('已存储精选产品描述');
        
        // 存储客户评价
        const testimonialsJson = JSON.stringify(config['testimonials-description']);
        console.log('客户评价JSON:', testimonialsJson);
        await stella.put('testimonials-description', testimonialsJson);
        console.log('已存储客户评价');
        
        console.log('KV存储初始化完成！');
        
        // 如果是在模拟环境中，显示提示
        if (stella.isMock) {
            console.warn('注意: 当前使用的是模拟KV存储API，配置已保存到localStorage，但不会同步到EdgeOne KV存储');
        }
        
        return true;
    } catch (error) {
        console.error('KV存储初始化失败:', error);
        return false;
    }
} 
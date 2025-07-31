/**
 * EdgeOne KV存储初始化脚本
 * 命名空间名称: stella
 * 命名空间ID: ns-ctd2RL3uTaAj
 */

// 初始化KV存储
(function() {
    // 检查是否在EdgeOne Pages环境中
    if (typeof stella === 'undefined') {
        console.error('KV存储初始化失败: stella命名空间未定义，请确保在EdgeOne Pages环境中运行');
        
        // 创建一个模拟的KV存储API，用于本地开发测试
        window.stella = {
            async get(key, type) {
                console.warn(`KV存储模拟: 获取键 "${key}" (类型: ${type})`);
                
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
                return true;
            },
            
            async delete(key) {
                console.warn(`KV存储模拟: 删除键 "${key}"`);
                return true;
            },
            
            async list(options) {
                console.warn('KV存储模拟: 列出键', options);
                return {
                    keys: [],
                    list_complete: true,
                    cursor: ''
                };
            }
        };
    } else {
        console.log('KV存储初始化成功: stella命名空间已加载');
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
        await stella.put('services-description', JSON.stringify(config['services-description']));
        console.log('已存储服务描述');
        
        // 存储精选产品描述
        await stella.put('featured-products-description', config['featured-products-description']);
        console.log('已存储精选产品描述');
        
        // 存储客户评价
        await stella.put('testimonials-description', JSON.stringify(config['testimonials-description']));
        console.log('已存储客户评价');
        
        console.log('KV存储初始化完成！');
        return true;
    } catch (error) {
        console.error('KV存储初始化失败:', error);
        return false;
    }
} 
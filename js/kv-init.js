// 初始化KV存储
(function () {
    // 创建内存缓存
    const memoryCache = {};
    const cacheTTL = 0; // 禁用缓存，设置为0

    // 创建KV存储API客户端
    window.stella = {
        // 标记为API客户端模式
        isApiClient: true,
        isMock: false,

        // 通过API获取键值
        async get(key, type) {
            console.log(`KV存储API: 获取键 "${key}" (类型: ${type})`);

            // 检查URL中是否有强制刷新参数
            const urlParams = new URLSearchParams(window.location.search);
            const forceRefresh = urlParams.has('refresh');

            // 只有在非强制刷新模式下才检查缓存
            const cacheKey = `${key}_${type}`;
            const cachedItem = memoryCache[cacheKey];
            if (!forceRefresh && cacheTTL > 0 && cachedItem && (Date.now() - cachedItem.timestamp) < cacheTTL) {
                console.log(`KV存储API: 从缓存获取键 "${key}"`);
                return cachedItem.value;
            }

            // 重试次数和延迟
            const maxRetries = 2; // 增加重试次数
            let retryCount = 0;

            while (retryCount <= maxRetries) {
                try {
                    // 添加时间戳参数避免浏览器缓存
                    const timestamp = new Date().getTime();
                    // 添加强制一致性参数
                    const forceConsistency = forceRefresh ? '&force_consistency=1' : '';
                    const response = await fetch(`/api/kv/${key}?t=${timestamp}${forceConsistency}`, {
                        method: 'GET',
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        },
                        // 添加credentials选项，确保跨浏览器一致性
                        credentials: 'same-origin'
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log(`KV存储API: 获取键 "${key}" 成功:`, data);

                        let value = data.value;

                        // 根据请求的类型处理值
                        if (type === 'json' && typeof value === 'string') {
                            try {
                                value = JSON.parse(value);
                            } catch (error) {
                                console.error(`KV存储API: 解析JSON失败:`, error);
                                value = null;
                            }
                        }

                        // 保存到内存缓存
                        memoryCache[cacheKey] = {
                            value: value,
                            timestamp: Date.now()
                        };

                        return value;
                    } else {
                        throw new Error(`API返回错误: ${response.status} ${response.statusText}`);
                    }
                } catch (error) {
                    retryCount++;
                    if (retryCount <= maxRetries) {
                        const delay = 500; // 固定较短的延迟
                        console.warn(`KV存储API: 获取键 "${key}" 失败，${maxRetries - retryCount + 1}次重试机会剩余，等待${delay}ms后重试:`, error);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    } else {
                        console.error(`KV存储API: 获取键 "${key}" 失败，已达到最大重试次数:`, error);

                        // 如果API失败，回退到默认值
                        const defaultValue = this._getDefaultValue(key, type);

                        // 保存默认值到内存缓存
                        memoryCache[cacheKey] = {
                            value: defaultValue,
                            timestamp: Date.now()
                        };

                        return defaultValue;
                    }
                }
            }
        },

        // 通过API设置键值
        async put(key, value) {
            console.log(`KV存储API: 设置键 "${key}" 的值为:`, value);

            // 更新内存缓存
            const cacheKeyText = `${key}_text`;
            const cacheKeyJson = `${key}_json`;
            memoryCache[cacheKeyText] = {
                value: typeof value === 'string' ? value : JSON.stringify(value),
                timestamp: Date.now()
            };
            memoryCache[cacheKeyJson] = {
                value: typeof value === 'string' ? (function () { try { return JSON.parse(value); } catch (e) { return value; } })() : value,
                timestamp: Date.now()
            };

            // 重试次数和延迟
            const maxRetries = 2; // 增加重试次数
            let retryCount = 0;

            while (retryCount <= maxRetries) {
                try {
                    // 添加强制一致性参数
                    const timestamp = new Date().getTime();
                    const response = await fetch(`/api/kv/${key}?t=${timestamp}&force_consistency=1`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        },
                        // 添加credentials选项，确保跨浏览器一致性
                        credentials: 'same-origin',
                        body: JSON.stringify({ value })
                    });

                    if (response.ok) {
                        console.log(`KV存储API: 设置键 "${key}" 成功`);
                        return true;
                    } else {
                        throw new Error(`API返回错误: ${response.status} ${response.statusText}`);
                    }
                } catch (error) {
                    retryCount++;
                    if (retryCount <= maxRetries) {
                        const delay = 500; // 固定较短的延迟
                        console.warn(`KV存储API: 设置键 "${key}" 失败，${maxRetries - retryCount + 1}次重试机会剩余，等待${delay}ms后重试:`, error);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    } else {
                        console.error(`KV存储API: 设置键 "${key}" 失败，已达到最大重试次数:`, error);

                        // 如果API失败，保存到localStorage作为备份
                        this._saveToLocalStorage(key, value);
                        return false;
                    }
                }
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

        // 清除内存缓存
        clearCache() {
            console.log('KV存储API: 清除内存缓存');
            for (let key in memoryCache) {
                delete memoryCache[key];
            }
            return true;
        },

        // 强制刷新页面
        forceRefresh() {
            console.log('KV存储API: 强制刷新页面');
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('refresh', Date.now());
            window.location.href = currentUrl.toString();
        },

        // 清除服务器缓存
        async clearServerCache() {
            console.log('KV存储API: 清除服务器缓存');
            try {
                // 清除本地缓存
                this.clearCache();

                // 清除服务器缓存
                const timestamp = new Date().getTime();
                const response = await fetch(`/api/kv/config?t=${timestamp}&clear_cache=1`, {
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    },
                    credentials: 'same-origin'
                });

                if (response.ok) {
                    console.log('KV存储API: 服务器缓存已清除');
                    return true;
                } else {
                    throw new Error(`API返回错误: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error('KV存储API: 清除服务器缓存失败:', error);
                return false;
            }
        },

        // 强制同步
        async forceSync() {
            console.log('KV存储API: 强制同步');
            try {
                // 清除缓存
                await this.clearServerCache();

                // 获取所有键
                let keys = [];
                try {
                    const response = await fetch('/api/kv', {
                        method: 'GET',
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        },
                        credentials: 'same-origin'
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.keys && Array.isArray(data.keys)) {
                            keys = data.keys.map(key => key.name);
                            console.log('KV存储API: 获取到的键:', keys);
                        } else {
                            console.warn('KV存储API: 获取键列表返回的数据格式不正确:', data);
                            // 使用预定义的关键键
                            keys = [
                                'hero-bg',
                                'hero-content-title',
                                'hero-content-description',
                                'services-description',
                                'featured-products-description',
                                'testimonials-description',
                                'config'
                            ];
                            console.log('KV存储API: 使用预定义的键:', keys);
                        }
                    } else {
                        throw new Error(`API返回错误: ${response.status} ${response.statusText}`);
                    }
                } catch (error) {
                    console.error('KV存储API: 获取键列表失败，使用预定义的键:', error);
                    // 使用预定义的关键键
                    keys = [
                        'hero-bg',
                        'hero-content-title',
                        'hero-content-description',
                        'services-description',
                        'featured-products-description',
                        'testimonials-description',
                        'config'
                    ];
                    console.log('KV存储API: 使用预定义的键:', keys);
                }

                if (keys.length === 0) {
                    console.warn('KV存储API: 没有找到任何键，无法进行同步');
                    return false;
                }

                // 对每个键强制读取一次，带有重试机制
                const results = [];
                for (const key of keys) {
                    let success = false;
                    let retryCount = 0;
                    const maxRetries = 3;

                    while (!success && retryCount <= maxRetries) {
                        try {
                            console.log(`KV存储API: 同步键 "${key}" (尝试 ${retryCount + 1}/${maxRetries + 1})`);
                            const timestamp = Date.now();
                            const response = await fetch(`/api/kv/${key}?t=${timestamp}&force_consistency=1`, {
                                method: 'GET',
                                headers: {
                                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                                    'Pragma': 'no-cache',
                                    'Expires': '0'
                                },
                                credentials: 'same-origin'
                            });

                            if (response.ok) {
                                const data = await response.json();
                                console.log(`KV存储API: 同步键 "${key}" 成功:`, data);
                                success = true;
                                results.push({ key, success: true });
                            } else {
                                throw new Error(`API返回错误: ${response.status} ${response.statusText}`);
                            }
                        } catch (error) {
                            retryCount++;
                            console.error(`KV存储API: 同步键 "${key}" 失败:`, error);

                            if (retryCount <= maxRetries) {
                                const delay = 500 * retryCount; // 逐渐增加延迟
                                console.log(`KV存储API: 将在 ${delay}ms 后重试...`);
                                await new Promise(resolve => setTimeout(resolve, delay));
                            } else {
                                console.error(`KV存储API: 同步键 "${key}" 达到最大重试次数，放弃`);
                                results.push({ key, success: false, error: error.message });
                            }
                        }
                    }
                }

                // 等待一段时间，确保数据传播
                console.log('KV存储API: 等待数据传播...');
                await new Promise(resolve => setTimeout(resolve, 2000));

                // 分析结果
                const successCount = results.filter(r => r.success).length;
                const totalCount = results.length;
                const success = successCount === totalCount;

                console.log(`KV存储API: 强制同步完成，成功: ${successCount}/${totalCount}`);

                if (!success) {
                    console.warn('KV存储API: 部分键同步失败:', results.filter(r => !r.success));
                }

                return success;
            } catch (error) {
                console.error('KV存储API: 强制同步失败:', error);
                return false;
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
    (async function () {
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
// 在kv-init.js文件的末尾添加或修改
// 导出一个函数，用于将配置数据初始化到KV存储中
window.initializeKVWithConfig = async function (config) {
    try {
        console.log('开始初始化KV存储...');
        console.log('配置数据:', config);

        // 先尝试保存完整配置
        try {
            await stella.put('config', JSON.stringify(config));
            console.log('已保存完整配置到config键');
        } catch (error) {
            console.warn('保存完整配置失败:', error);
        }

        // 逐个保存各项配置
        await stella.put('hero-bg', config['hero-bg']);
        console.log('已存储hero背景');

        await stella.put('hero-content-title', config['hero-content-title']);
        console.log('已存储hero标题');

        await stella.put('hero-content-description', config['hero-content-description']);
        console.log('已存储hero描述');

        const servicesJson = JSON.stringify(config['services-description']);
        console.log('服务描述JSON:', servicesJson);
        await stella.put('services-description', servicesJson);
        console.log('已存储服务描述');

        await stella.put('featured-products-description', config['featured-products-description']);
        console.log('已存储精选产品描述');

        const testimonialsJson = JSON.stringify(config['testimonials-description']);
        console.log('客户评价JSON:', testimonialsJson);
        await stella.put('testimonials-description', testimonialsJson);
        console.log('已存储客户评价');

        console.log('KV存储初始化完成！');
        return true;
    } catch (error) {
        console.error('KV存储初始化失败:', error);
        return false;
    }
};
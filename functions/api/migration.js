// EdgeOne Functions - 数据迁移API (Gitee ↔ KV 存储)
export async function onRequestPost({ request, env }) {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        const { action, dataType = 'all' } = await request.json();

        // 验证用户身份
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Missing authorization header' 
            }), { status: 401, headers });
        }

        const [type, credentials] = authHeader.split(' ');
        if (type !== 'Basic') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Invalid authorization type' 
            }), { status: 401, headers });
        }

        const [username, password] = atob(credentials).split(':');
        if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Invalid credentials' 
            }), { status: 401, headers });
        }

        // Gitee配置
        const giteeConfig = {
            username: env.GITEE_USERNAME,
            repo: env.GITEE_REPO,
            token: env.GITEE_TOKEN
        };

        if (action === 'migrateGiteeToKV') {
            // 从Gitee迁移到KV存储
            const results = { configs: [], products: [], errors: [] };

            // 迁移配置文件
            if (dataType === 'all' || dataType === 'configs') {
                if (env.CONFIG_KV) {
                    try {
                        const configResults = await migrateConfigsGiteeToKV(giteeConfig, env.CONFIG_KV);
                        results.configs = configResults;
                    } catch (error) {
                        results.errors.push({ type: 'configs', error: error.message });
                    }
                } else {
                    results.errors.push({ type: 'configs', error: 'CONFIG_KV 未配置' });
                }
            }

            // 迁移产品文件
            if (dataType === 'all' || dataType === 'products') {
                if (env.PRODUCTS_KV) {
                    try {
                        const productResults = await migrateProductsGiteeToKV(giteeConfig, env.PRODUCTS_KV);
                        results.products = productResults;
                    } catch (error) {
                        results.errors.push({ type: 'products', error: error.message });
                    }
                } else {
                    results.errors.push({ type: 'products', error: 'PRODUCTS_KV 未配置' });
                }
            }

            const totalMigrated = results.configs.filter(c => c.status === 'success').length + 
                                 results.products.filter(p => p.status === 'success').length;

            return new Response(JSON.stringify({
                success: true,
                message: `成功迁移 ${totalMigrated} 个文件到KV存储`,
                results: results
            }), { status: 200, headers });

        } else if (action === 'migrateKVToGitee') {
            // 从KV存储迁移到Gitee
            const results = { configs: [], products: [], errors: [] };

            // 迁移配置文件
            if (dataType === 'all' || dataType === 'configs') {
                if (env.CONFIG_KV) {
                    try {
                        const configResults = await migrateConfigsKVToGitee(env.CONFIG_KV, giteeConfig);
                        results.configs = configResults;
                    } catch (error) {
                        results.errors.push({ type: 'configs', error: error.message });
                    }
                } else {
                    results.errors.push({ type: 'configs', error: 'CONFIG_KV 未配置' });
                }
            }

            // 迁移产品文件
            if (dataType === 'all' || dataType === 'products') {
                if (env.PRODUCTS_KV) {
                    try {
                        const productResults = await migrateProductsKVToGitee(env.PRODUCTS_KV, giteeConfig);
                        results.products = productResults;
                    } catch (error) {
                        results.errors.push({ type: 'products', error: error.message });
                    }
                } else {
                    results.errors.push({ type: 'products', error: 'PRODUCTS_KV 未配置' });
                }
            }

            const totalMigrated = results.configs.filter(c => c.status === 'success').length + 
                                 results.products.filter(p => p.status === 'success').length;

            return new Response(JSON.stringify({
                success: true,
                message: `成功迁移 ${totalMigrated} 个文件到Gitee`,
                results: results
            }), { status: 200, headers });

        } else if (action === 'syncData') {
            // 双向同步数据
            return new Response(JSON.stringify({
                success: false,
                error: '双向同步功能暂未实现'
            }), { status: 501, headers });

        } else if (action === 'getStorageInfo') {
            // 获取存储信息
            const info = {
                gitee: { available: !!(giteeConfig.username && giteeConfig.repo && giteeConfig.token) },
                kv: {
                    config: !!env.CONFIG_KV,
                    products: !!env.PRODUCTS_KV
                }
            };

            // 获取KV存储统计
            if (env.CONFIG_KV) {
                try {
                    const configsList = await env.CONFIG_KV.get('configs:list', { type: 'json' }) || [];
                    info.kv.configCount = configsList.length;
                } catch (e) {
                    info.kv.configCount = 0;
                }
            }

            if (env.PRODUCTS_KV) {
                try {
                    const productsList = await env.PRODUCTS_KV.get('products:list', { type: 'json' }) || [];
                    info.kv.productCount = productsList.length;
                } catch (e) {
                    info.kv.productCount = 0;
                }
            }

            return new Response(JSON.stringify({
                success: true,
                storageInfo: info
            }), { status: 200, headers });
        }

        return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid action' 
        }), { status: 400, headers });

    } catch (error) {
        console.error('Migration API Error:', error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: 'Internal server error',
            message: error.message 
        }), { status: 500, headers });
    }
}

// Handle OPTIONS preflight requests
export async function onRequestOptions({ request }) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
    };
    return new Response(null, { status: 204, headers });
}

// 迁移配置文件：Gitee -> KV
async function migrateConfigsGiteeToKV(giteeConfig, configKV) {
    const url = `https://gitee.com/api/v5/repos/${giteeConfig.username}/${giteeConfig.repo}/contents/config?access_token=${giteeConfig.token}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) {
            return []; // 配置文件夹不存在
        }
        throw new Error(`获取Gitee配置列表失败: HTTP ${response.status}`);
    }

    const data = await response.json();
    const jsonFiles = data.filter(file => file.type === 'file' && file.name.endsWith('.json'));
    
    const results = [];
    const configsList = [];

    for (const file of jsonFiles) {
        try {
            const fileResponse = await fetch(file.download_url);
            const configData = await fileResponse.json();
            const configType = file.name.replace('.json', '');
            
            // 保存到KV存储
            await configKV.put(`config:${configType}`, JSON.stringify(configData));
            
            configsList.push({
                type: configType,
                name: file.name,
                updatedAt: new Date().toISOString()
            });
            
            results.push({
                type: configType,
                status: 'success'
            });
        } catch (error) {
            results.push({
                type: file.name.replace('.json', ''),
                status: 'error',
                error: error.message
            });
        }
    }

    // 更新配置列表索引
    await configKV.put('configs:list', JSON.stringify(configsList));

    return results;
}

// 迁移产品文件：Gitee -> KV
async function migrateProductsGiteeToKV(giteeConfig, productsKV) {
    const url = `https://gitee.com/api/v5/repos/${giteeConfig.username}/${giteeConfig.repo}/contents/products?access_token=${giteeConfig.token}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) {
            return []; // 产品文件夹不存在
        }
        throw new Error(`获取Gitee产品列表失败: HTTP ${response.status}`);
    }

    const data = await response.json();
    const jsonFiles = data.filter(file => file.type === 'file' && file.name.endsWith('.json'));
    
    const results = [];
    const productsList = [];

    for (const file of jsonFiles) {
        try {
            const fileResponse = await fetch(file.download_url);
            const productData = await fileResponse.json();
            const item = file.name.replace('.json', '');
            
            // 保存到KV存储
            await productsKV.put(`product:${item}`, JSON.stringify(productData));
            
            productsList.push({
                item: item,
                name: file.name,
                title: productData.title || '未命名产品',
                updatedAt: new Date().toISOString()
            });
            
            results.push({
                item: item,
                status: 'success'
            });
        } catch (error) {
            results.push({
                item: file.name.replace('.json', ''),
                status: 'error',
                error: error.message
            });
        }
    }

    // 更新产品列表索引
    await productsKV.put('products:list', JSON.stringify(productsList));

    return results;
}

// 迁移配置文件：KV -> Gitee
async function migrateConfigsKVToGitee(configKV, giteeConfig) {
    const configsList = await configKV.get('configs:list', { type: 'json' }) || [];
    
    const results = [];

    for (const config of configsList) {
        try {
            const configData = await configKV.get(`config:${config.type}`, { type: 'json' });
            
            if (configData) {
                // 保存到Gitee
                const filePath = `config/${config.type}.json`;
                const url = `https://gitee.com/api/v5/repos/${giteeConfig.username}/${giteeConfig.repo}/contents/${filePath}`;
                
                const requestBody = {
                    access_token: giteeConfig.token,
                    content: Buffer.from(JSON.stringify(configData, null, 2), 'utf-8').toString('base64'),
                    message: `从KV存储迁移配置 ${config.type}`
                };

                const saveResponse = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                if (saveResponse.ok) {
                    results.push({
                        type: config.type,
                        status: 'success'
                    });
                } else {
                    results.push({
                        type: config.type,
                        status: 'error',
                        error: `HTTP ${saveResponse.status}`
                    });
                }
            }
        } catch (error) {
            results.push({
                type: config.type,
                status: 'error',
                error: error.message
            });
        }
    }

    return results;
}

// 迁移产品文件：KV -> Gitee
async function migrateProductsKVToGitee(productsKV, giteeConfig) {
    const productsList = await productsKV.get('products:list', { type: 'json' }) || [];
    
    const results = [];

    for (const product of productsList) {
        try {
            const productData = await productsKV.get(`product:${product.item}`, { type: 'json' });
            
            if (productData) {
                // 保存到Gitee
                const filePath = `products/${product.item}.json`;
                const url = `https://gitee.com/api/v5/repos/${giteeConfig.username}/${giteeConfig.repo}/contents/${filePath}`;
                
                const requestBody = {
                    access_token: giteeConfig.token,
                    content: Buffer.from(JSON.stringify(productData, null, 2), 'utf-8').toString('base64'),
                    message: `从KV存储迁移产品 ${product.item}`
                };

                const saveResponse = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                if (saveResponse.ok) {
                    results.push({
                        item: product.item,
                        status: 'success'
                    });
                } else {
                    results.push({
                        item: product.item,
                        status: 'error',
                        error: `HTTP ${saveResponse.status}`
                    });
                }
            }
        } catch (error) {
            results.push({
                item: product.item,
                status: 'error',
                error: error.message
            });
        }
    }

    return results;
}

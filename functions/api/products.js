// EdgeOne Functions - 产品管理API (支持 Gitee 和 KV 存储)
export async function onRequestPost({ request, env }) {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        const { action, item, productData, storageType = 'gitee' } = await request.json();

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

        // 获取Gitee配置
        const giteeConfig = {
            username: env.GITEE_USERNAME,
            repo: env.GITEE_REPO,
            token: env.GITEE_TOKEN
        };

        if (action === 'getProduct') {
            if (storageType === 'kv' && env.PRODUCTS_KV) {
                // 从KV存储读取产品
                const productData = await env.PRODUCTS_KV.get(`product:${item}`, { type: 'json' });
                
                if (!productData) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Product not found',
                        message: `产品 ${item} 不存在`
                    }), { status: 404, headers });
                }

                return new Response(JSON.stringify({
                    success: true,
                    product: productData,
                    source: 'kv'
                }), { status: 200, headers });
            } else {
                // 从Gitee读取产品文件
                const url = `https://gitee.com/api/v5/repos/${giteeConfig.username}/${giteeConfig.repo}/contents/products/${item}.json?access_token=${giteeConfig.token}`;
                
                const response = await fetch(url);
                if (!response.ok) {
                    if (response.status === 404) {
                        return new Response(JSON.stringify({
                            success: false,
                            error: 'Product not found',
                            message: `产品 ${item} 不存在`
                        }), { status: 404, headers });
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
                
                return new Response(JSON.stringify({
                    success: true,
                    product: content,
                    sha: data.sha,
                    source: 'gitee'
                }), { status: 200, headers });
            }

        } else if (action === 'saveProduct') {
            if (storageType === 'kv' && env.PRODUCTS_KV) {
                // 保存产品到KV存储
                await env.PRODUCTS_KV.put(`product:${item}`, JSON.stringify(productData));
                
                // 更新产品列表索引
                let productsList = await env.PRODUCTS_KV.get('products:list', { type: 'json' }) || [];
                if (!productsList.some(p => p.item === item)) {
                    productsList.push({
                        item: item,
                        name: `${item}.json`,
                        title: productData.title || '未命名产品',
                        updatedAt: new Date().toISOString()
                    });
                    await env.PRODUCTS_KV.put('products:list', JSON.stringify(productsList));
                }

                // 更新统计
                await updateProductStats(env.PRODUCTS_KV, 'save', item);

                return new Response(JSON.stringify({
                    success: true,
                    message: `产品 ${item} 保存到KV存储成功`,
                    source: 'kv'
                }), { status: 200, headers });
            } else {
                // 保存产品文件到Gitee
                const filePath = `products/${item}.json`;
                let url = `https://gitee.com/api/v5/repos/${giteeConfig.username}/${giteeConfig.repo}/contents/${filePath}`;
                
                // 检查文件是否存在
                let sha = null;
                try {
                    const checkResponse = await fetch(`${url}?access_token=${giteeConfig.token}`);
                    if (checkResponse.ok) {
                        const checkData = await checkResponse.json();
                        sha = checkData.sha;
                    }
                } catch (e) {
                    // 文件不存在，这是正常的
                }

                const requestBody = {
                    access_token: giteeConfig.token,
                    content: Buffer.from(JSON.stringify(productData, null, 2), 'utf-8').toString('base64'),
                    message: `${sha ? '更新' : '创建'} 产品 ${item}`,
                    ...(sha && { sha })
                };

                const saveResponse = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                if (!saveResponse.ok) {
                    throw new Error(`保存失败: HTTP ${saveResponse.status}`);
                }

                const result = await saveResponse.json();
                return new Response(JSON.stringify({
                    success: true,
                    message: `产品 ${item} ${sha ? '更新' : '创建'}成功`,
                    sha: result.content.sha,
                    source: 'gitee'
                }), { status: 200, headers });
            }

        } else if (action === 'listProducts') {
            if (storageType === 'kv' && env.PRODUCTS_KV) {
                // 从KV存储列出产品
                const productsList = await env.PRODUCTS_KV.get('products:list', { type: 'json' }) || [];
                
                return new Response(JSON.stringify({
                    success: true,
                    products: productsList,
                    source: 'kv'
                }), { status: 200, headers });
            } else {
                // 从Gitee列出所有产品
                const url = `https://gitee.com/api/v5/repos/${giteeConfig.username}/${giteeConfig.repo}/contents/products?access_token=${giteeConfig.token}`;
                
                const response = await fetch(url);
                if (!response.ok) {
                    if (response.status === 404) {
                        return new Response(JSON.stringify({
                            success: true,
                            products: [],
                            message: 'products文件夹不存在，将在创建第一个产品时自动创建',
                            source: 'gitee'
                        }), { status: 200, headers });
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                const products = data
                    .filter(file => file.type === 'file' && file.name.endsWith('.json'))
                    .map(file => ({
                        item: file.name.replace('.json', ''),
                        name: file.name,
                        size: file.size,
                        download_url: file.download_url
                    }));

                return new Response(JSON.stringify({
                    success: true,
                    products: products,
                    source: 'gitee'
                }), { status: 200, headers });
            }

        } else if (action === 'getTimestamp') {
            // 获取当前时间戳
            const timestamp = Date.now();
            return new Response(JSON.stringify({
                success: true,
                timestamp: timestamp,
                readable: new Date(timestamp).toLocaleString('zh-CN')
            }), { status: 200, headers });

        } else if (action === 'migrateToKV') {
            // 数据迁移：从Gitee迁移到KV存储
            if (!env.PRODUCTS_KV) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'KV存储未配置'
                }), { status: 400, headers });
            }

            const url = `https://gitee.com/api/v5/repos/${giteeConfig.username}/${giteeConfig.repo}/contents/products?access_token=${giteeConfig.token}`;
            
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`获取Gitee产品列表失败: HTTP ${response.status}`);
                }

                const data = await response.json();
                const jsonFiles = data.filter(file => file.type === 'file' && file.name.endsWith('.json'));
                
                let migratedCount = 0;
                const migrationResults = [];

                for (const file of jsonFiles) {
                    try {
                        const fileResponse = await fetch(file.download_url);
                        const productData = await fileResponse.json();
                        const item = file.name.replace('.json', '');
                        
                        // 保存到KV存储
                        await env.PRODUCTS_KV.put(`product:${item}`, JSON.stringify(productData));
                        
                        migrationResults.push({
                            item: item,
                            status: 'success',
                            title: productData.title || '未命名产品'
                        });
                        
                        migratedCount++;
                    } catch (error) {
                        migrationResults.push({
                            item: file.name.replace('.json', ''),
                            status: 'error',
                            error: error.message
                        });
                    }
                }

                // 更新产品列表索引
                const productsList = migrationResults
                    .filter(r => r.status === 'success')
                    .map(r => ({
                        item: r.item,
                        name: `${r.item}.json`,
                        title: r.title,
                        updatedAt: new Date().toISOString()
                    }));
                
                await env.PRODUCTS_KV.put('products:list', JSON.stringify(productsList));

                return new Response(JSON.stringify({
                    success: true,
                    message: `成功迁移 ${migratedCount} 个产品到KV存储`,
                    migrated: migratedCount,
                    total: jsonFiles.length,
                    results: migrationResults
                }), { status: 200, headers });

            } catch (error) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '迁移过程中出错',
                    message: error.message
                }), { status: 500, headers });
            }

        } else if (action === 'migrateToGitee') {
            // 数据迁移：从KV存储迁移到Gitee
            if (!env.PRODUCTS_KV) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'KV存储未配置'
                }), { status: 400, headers });
            }

            try {
                const productsList = await env.PRODUCTS_KV.get('products:list', { type: 'json' }) || [];
                
                let migratedCount = 0;
                const migrationResults = [];

                for (const product of productsList) {
                    try {
                        const productData = await env.PRODUCTS_KV.get(`product:${product.item}`, { type: 'json' });
                        
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
                                migrationResults.push({
                                    item: product.item,
                                    status: 'success'
                                });
                                migratedCount++;
                            } else {
                                migrationResults.push({
                                    item: product.item,
                                    status: 'error',
                                    error: `HTTP ${saveResponse.status}`
                                });
                            }
                        }
                    } catch (error) {
                        migrationResults.push({
                            item: product.item,
                            status: 'error',
                            error: error.message
                        });
                    }
                }

                return new Response(JSON.stringify({
                    success: true,
                    message: `成功迁移 ${migratedCount} 个产品到Gitee`,
                    migrated: migratedCount,
                    total: productsList.length,
                    results: migrationResults
                }), { status: 200, headers });

            } catch (error) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '迁移过程中出错',
                    message: error.message
                }), { status: 500, headers });
            }
        }

        return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid action' 
        }), { status: 400, headers });

    } catch (error) {
        console.error('Products API Error:', error);
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

// 更新产品操作统计
async function updateProductStats(kv, operation, item) {
    try {
        const statsKey = `stats:products:${operation}`;
        const currentStats = await kv.get(statsKey, { type: 'json' }) || { count: 0, lastAccess: null, items: [] };
        
        currentStats.count += 1;
        currentStats.lastAccess = new Date().toISOString();
        
        // 记录最近操作的产品
        if (!currentStats.items.includes(item)) {
            currentStats.items.unshift(item);
            // 只保留最近10个
            currentStats.items = currentStats.items.slice(0, 10);
        }
        
        await kv.put(statsKey, JSON.stringify(currentStats));
    } catch (error) {
        console.error('更新产品统计失败:', error);
    }
}
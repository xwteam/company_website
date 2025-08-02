// EdgeOne Functions - 产品管理API
export async function onRequestPost({ request, env }) {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        const { action, item, productData } = await request.json();

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
            // 读取产品文件
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
                sha: data.sha
            }), { status: 200, headers });

        } else if (action === 'saveProduct') {
            // 保存产品文件
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
                sha: result.content.sha
            }), { status: 200, headers });

        } else if (action === 'listProducts') {
            // 列出所有产品
            const url = `https://gitee.com/api/v5/repos/${giteeConfig.username}/${giteeConfig.repo}/contents/products?access_token=${giteeConfig.token}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 404) {
                    return new Response(JSON.stringify({
                        success: true,
                        products: [],
                        message: 'products文件夹不存在，将在创建第一个产品时自动创建'
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
                products: products
            }), { status: 200, headers });

        } else if (action === 'getTimestamp') {
            // 获取当前时间戳
            const timestamp = Date.now();
            return new Response(JSON.stringify({
                success: true,
                timestamp: timestamp,
                readable: new Date(timestamp).toLocaleString('zh-CN')
            }), { status: 200, headers });
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
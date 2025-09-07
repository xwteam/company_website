// EdgeOne Functions - 配置管理API (支持 Gitee 和 KV 存储)
export async function onRequestPost({ request, env }) {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        const { action, configType, configData, storageType = 'gitee' } = await request.json();

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

        // 根据action处理请求
        if (action === 'getGiteeConfig') {
            return new Response(JSON.stringify({
                success: true,
                config: {
                    username: env.GITEE_USERNAME,
                    repo: env.GITEE_REPO,
                    token: env.GITEE_TOKEN
                }
            }), { status: 200, headers });

        } else if (action === 'getConfig') {
            // 获取配置文件
            if (!configType) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '缺少配置类型参数'
                }), { status: 400, headers });
            }

            if (storageType === 'kv' && env.CONFIG_KV) {
                // 从KV存储获取配置
                const configData = await env.CONFIG_KV.get(`config:${configType}`, { type: 'json' });
                
                if (!configData) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Configuration not found',
                        message: `配置 ${configType} 不存在`
                    }), { status: 404, headers });
                }

                return new Response(JSON.stringify({
                    success: true,
                    config: configData,
                    source: 'kv'
                }), { status: 200, headers });
            } else {
                // 从Gitee获取配置文件
                const giteeConfig = {
                    username: env.GITEE_USERNAME,
                    repo: env.GITEE_REPO,
                    token: env.GITEE_TOKEN
                };

                const filePath = `config/${configType}.json`;
                const url = `https://gitee.com/api/v5/repos/${giteeConfig.username}/${giteeConfig.repo}/contents/${filePath}?access_token=${giteeConfig.token}`;
                
                const response = await fetch(url);
                if (!response.ok) {
                    if (response.status === 404) {
                        return new Response(JSON.stringify({
                            success: false,
                            error: 'Configuration not found',
                            message: `配置文件 ${configType}.json 不存在`
                        }), { status: 404, headers });
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
                
                return new Response(JSON.stringify({
                    success: true,
                    config: content,
                    sha: data.sha,
                    source: 'gitee'
                }), { status: 200, headers });
            }

        } else if (action === 'saveConfig') {
            // 保存配置文件
            if (!configType || !configData) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '缺少配置类型或数据参数'
                }), { status: 400, headers });
            }

            if (storageType === 'kv' && env.CONFIG_KV) {
                // 保存配置到KV存储
                await env.CONFIG_KV.put(`config:${configType}`, JSON.stringify(configData));
                
                // 更新配置列表索引
                let configsList = await env.CONFIG_KV.get('configs:list', { type: 'json' }) || [];
                if (!configsList.some(c => c.type === configType)) {
                    configsList.push({
                        type: configType,
                        name: `${configType}.json`,
                        updatedAt: new Date().toISOString()
                    });
                    await env.CONFIG_KV.put('configs:list', JSON.stringify(configsList));
                }

                // 更新统计
                await updateConfigStats(env.CONFIG_KV, 'save', configType);

                return new Response(JSON.stringify({
                    success: true,
                    message: `配置 ${configType} 保存到KV存储成功`,
                    source: 'kv'
                }), { status: 200, headers });
            } else {
                // 保存配置到Gitee
                const giteeConfig = {
                    username: env.GITEE_USERNAME,
                    repo: env.GITEE_REPO,
                    token: env.GITEE_TOKEN
                };

                const filePath = `config/${configType}.json`;
                const url = `https://gitee.com/api/v5/repos/${giteeConfig.username}/${giteeConfig.repo}/contents/${filePath}`;
                
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
                    content: Buffer.from(JSON.stringify(configData, null, 2), 'utf-8').toString('base64'),
                    message: `${sha ? '更新' : '创建'} 配置 ${configType}`,
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
                    message: `配置 ${configType} ${sha ? '更新' : '创建'}成功`,
                    sha: result.content.sha,
                    source: 'gitee'
                }), { status: 200, headers });
            }

        } else if (action === 'listConfigs') {
            // 列出所有配置
            if (storageType === 'kv' && env.CONFIG_KV) {
                const configsList = await env.CONFIG_KV.get('configs:list', { type: 'json' }) || [];
                
                return new Response(JSON.stringify({
                    success: true,
                    configs: configsList,
                    source: 'kv'
                }), { status: 200, headers });
            } else {
                // 从Gitee列出配置文件
                const giteeConfig = {
                    username: env.GITEE_USERNAME,
                    repo: env.GITEE_REPO,
                    token: env.GITEE_TOKEN
                };

                const url = `https://gitee.com/api/v5/repos/${giteeConfig.username}/${giteeConfig.repo}/contents/config?access_token=${giteeConfig.token}`;
                
                const response = await fetch(url);
                if (!response.ok) {
                    if (response.status === 404) {
                        return new Response(JSON.stringify({
                            success: true,
                            configs: [],
                            message: 'config文件夹不存在',
                            source: 'gitee'
                        }), { status: 200, headers });
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                const configs = data
                    .filter(file => file.type === 'file' && file.name.endsWith('.json'))
                    .map(file => ({
                        type: file.name.replace('.json', ''),
                        name: file.name,
                        size: file.size,
                        download_url: file.download_url
                    }));

                return new Response(JSON.stringify({
                    success: true,
                    configs: configs,
                    source: 'gitee'
                }), { status: 200, headers });
            }
        }

        return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid action' 
        }), { status: 400, headers });

    } catch (error) {
        console.error('Config API Error:', error);
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

// 更新配置操作统计
async function updateConfigStats(kv, operation, configType) {
    try {
        const statsKey = `stats:configs:${operation}`;
        const currentStats = await kv.get(statsKey, { type: 'json' }) || { count: 0, lastAccess: null, configs: [] };
        
        currentStats.count += 1;
        currentStats.lastAccess = new Date().toISOString();
        
        // 记录最近操作的配置
        if (!currentStats.configs.includes(configType)) {
            currentStats.configs.unshift(configType);
            // 只保留最近10个
            currentStats.configs = currentStats.configs.slice(0, 10);
        }
        
        await kv.put(statsKey, JSON.stringify(currentStats));
    } catch (error) {
        console.error('更新配置统计失败:', error);
    }
}
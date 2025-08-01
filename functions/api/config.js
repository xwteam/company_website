/**
 * EdgeOne Pages KV存储 + Gitee API 双重保存系统
 * 安全的配置管理API接口
 */

// Gitee API配置（通过环境变量保护敏感信息）
const GITEE_CONFIG = {
    username: 'xwteam',
    repo: 'company_website',
    // 访问令牌通过EdgeOne环境变量获取，不在代码中暴露
    // 在EdgeOne控制台配置环境变量: GITEE_TOKEN
};

// 配置文件映射
const CONFIG_FILES = {
    'index': 'config/index.json',
    'products': 'config/products.json',
    'services': 'config/services.json',
    'partners': 'config/partners.json',
    'about': 'config/about.json',
    'contact': 'config/contact.json',
    'footer': 'config/footer.json'
};

// 简单的API密钥验证（通过环境变量配置）
function validateApiKey(request) {
    const apiKey = request.headers.get('X-API-Key');
    const validKey = process.env.API_SECRET || 'default-secret-key';
    return apiKey === validKey;
}

// Gitee API调用函数
async function updateGiteeFile(filename, content, commitMessage) {
    const token = process.env.GITEE_TOKEN;
    if (!token) {
        throw new Error('Gitee token not configured');
    }

    const apiUrl = `https://gitee.com/api/v5/repos/${GITEE_CONFIG.username}/${GITEE_CONFIG.repo}/contents/${filename}`;
    
    try {
        // 首先获取文件当前的SHA值
        const getResponse = await fetch(apiUrl + '?access_token=' + token);
        let currentSha = null;
        
        if (getResponse.ok) {
            const fileInfo = await getResponse.json();
            currentSha = fileInfo.sha;
        }

        // 准备更新请求
        const updateData = {
            access_token: token,
            message: commitMessage || `Update ${filename} via admin panel`,
            content: btoa(JSON.stringify(content, null, 2)), // Base64编码
        };

        if (currentSha) {
            updateData.sha = currentSha; // 更新现有文件
        }

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gitee API error: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Gitee API error:', error);
        throw error;
    }
}

// CORS处理
function setCorsHeaders(response) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
    return response;
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const method = request.method;
        const pathname = url.pathname;

        // 处理CORS预检请求
        if (method === 'OPTIONS') {
            return setCorsHeaders(new Response(null, { status: 200 }));
        }

        try {
            // 验证API密钥（保护接口安全）
            if (!validateApiKey(request)) {
                return setCorsHeaders(new Response(JSON.stringify({ 
                    error: 'Unauthorized',
                    message: 'Invalid API key'
                }), { 
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }));
            }

            // 路由处理
            if (pathname.startsWith('/api/config/')) {
                const configKey = pathname.split('/').pop();
                
                if (method === 'GET') {
                    return await handleGetConfig(configKey, env);
                } else if (method === 'POST' || method === 'PUT') {
                    return await handleSaveConfig(configKey, request, env);
                } else if (method === 'DELETE') {
                    return await handleDeleteConfig(configKey, env);
                }
            } else if (pathname === '/api/config/list') {
                return await handleListConfigs(env);
            } else if (pathname === '/api/config/sync') {
                return await handleSyncToGitee(request, env);
            }

            return setCorsHeaders(new Response(JSON.stringify({ 
                error: 'Not Found',
                message: 'API endpoint not found'
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            }));

        } catch (error) {
            console.error('API Error:', error);
            return setCorsHeaders(new Response(JSON.stringify({ 
                error: 'Internal Server Error',
                message: error.message
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }));
        }
    }
};

// 获取配置
async function handleGetConfig(configKey, env) {
    try {
        // 优先从KV存储读取
        const kvKey = `config-${configKey}`;
        const kvData = await env.stella.get(kvKey);
        
        if (kvData) {
            const parsedData = JSON.parse(kvData);
            return setCorsHeaders(new Response(JSON.stringify({
                success: true,
                data: parsedData,
                source: 'kv',
                timestamp: new Date().toISOString()
            }), {
                headers: { 'Content-Type': 'application/json' }
            }));
        }

        // KV中没有数据，返回提示
        return setCorsHeaders(new Response(JSON.stringify({
            success: false,
            message: 'Configuration not found in KV storage',
            source: 'none'
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        }));

    } catch (error) {
        throw new Error(`Failed to get config: ${error.message}`);
    }
}

// 保存配置（双重保存：KV + Gitee）
async function handleSaveConfig(configKey, request, env) {
    try {
        const configData = await request.json();
        const kvKey = `config-${configKey}`;
        const filename = CONFIG_FILES[configKey];

        if (!filename) {
            throw new Error(`Invalid config key: ${configKey}`);
        }

        let kvSuccess = false;
        let giteeSuccess = false;
        let kvError = null;
        let giteeError = null;

        // 1. 保存到KV存储（优先，立即生效）
        try {
            await env.stella.put(kvKey, JSON.stringify(configData));
            kvSuccess = true;
        } catch (error) {
            kvError = error.message;
            console.error('KV save error:', error);
        }

        // 2. 同步到Gitee（备份+版本控制）
        try {
            await updateGiteeFile(filename, configData, `Update ${configKey} config via admin panel`);
            giteeSuccess = true;
        } catch (error) {
            giteeError = error.message;
            console.error('Gitee sync error:', error);
        }

        // 返回保存结果
        const result = {
            success: kvSuccess || giteeSuccess,
            kv: {
                success: kvSuccess,
                error: kvError
            },
            gitee: {
                success: giteeSuccess,
                error: giteeError
            },
            timestamp: new Date().toISOString()
        };

        return setCorsHeaders(new Response(JSON.stringify(result), {
            status: result.success ? 200 : 500,
            headers: { 'Content-Type': 'application/json' }
        }));

    } catch (error) {
        throw new Error(`Failed to save config: ${error.message}`);
    }
}

// 删除配置
async function handleDeleteConfig(configKey, env) {
    try {
        const kvKey = `config-${configKey}`;
        await env.stella.delete(kvKey);

        return setCorsHeaders(new Response(JSON.stringify({
            success: true,
            message: `Configuration ${configKey} deleted from KV storage`,
            timestamp: new Date().toISOString()
        }), {
            headers: { 'Content-Type': 'application/json' }
        }));

    } catch (error) {
        throw new Error(`Failed to delete config: ${error.message}`);
    }
}

// 列出所有配置
async function handleListConfigs(env) {
    try {
        const configs = {};
        
        for (const [key, filename] of Object.entries(CONFIG_FILES)) {
            const kvKey = `config-${key}`;
            try {
                const data = await env.stella.get(kvKey);
                configs[key] = {
                    exists: !!data,
                    filename: filename,
                    size: data ? data.length : 0
                };
            } catch (error) {
                configs[key] = {
                    exists: false,
                    filename: filename,
                    error: error.message
                };
            }
        }

        return setCorsHeaders(new Response(JSON.stringify({
            success: true,
            configs: configs,
            timestamp: new Date().toISOString()
        }), {
            headers: { 'Content-Type': 'application/json' }
        }));

    } catch (error) {
        throw new Error(`Failed to list configs: ${error.message}`);
    }
}

// 手动同步所有配置到Gitee
async function handleSyncToGitee(request, env) {
    try {
        const results = {};
        
        for (const [key, filename] of Object.entries(CONFIG_FILES)) {
            const kvKey = `config-${key}`;
            try {
                const data = await env.stella.get(kvKey);
                if (data) {
                    const configData = JSON.parse(data);
                    await updateGiteeFile(filename, configData, `Sync ${key} config to Gitee`);
                    results[key] = { success: true };
                } else {
                    results[key] = { success: false, message: 'No data in KV' };
                }
            } catch (error) {
                results[key] = { success: false, error: error.message };
            }
        }

        return setCorsHeaders(new Response(JSON.stringify({
            success: true,
            results: results,
            timestamp: new Date().toISOString()
        }), {
            headers: { 'Content-Type': 'application/json' }
        }));

    } catch (error) {
        throw new Error(`Failed to sync to Gitee: ${error.message}`);
    }
}
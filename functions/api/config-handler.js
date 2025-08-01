// 配置管理API处理器
// 从原来的 config.js 分离出来的处理逻辑

// Gitee API配置
const GITEE_CONFIG = {
    username: 'xwteam',
    repo: 'company_website'
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

// 用户名密码验证
function validateAuth(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return false;
    }
    
    try {
        const encoded = authHeader.slice(6);
        const decoded = atob(encoded);
        const [username, password] = decoded.split(':');
        
        const validUsername = env.ADMIN_USERNAME || 'admin';
        const validPassword = env.ADMIN_PASSWORD || 'admin123';
        
        return username === validUsername && password === validPassword;
    } catch (error) {
        return false;
    }
}

// Gitee API调用
async function updateGiteeFile(filename, content, commitMessage, env) {
    const token = env.GITEE_TOKEN;
    if (!token) {
        throw new Error('Gitee token not configured');
    }

    const apiUrl = `https://gitee.com/api/v5/repos/${GITEE_CONFIG.username}/${GITEE_CONFIG.repo}/contents/${filename}`;
    
    try {
        const getResponse = await fetch(apiUrl + '?access_token=' + token);
        let currentSha = null;
        
        if (getResponse.ok) {
            const fileInfo = await getResponse.json();
            currentSha = fileInfo.sha;
        }

        const updateData = {
            access_token: token,
            message: commitMessage || `Update ${filename} via admin panel`,
            content: btoa(JSON.stringify(content, null, 2)),
        };

        if (currentSha) {
            updateData.sha = currentSha;
        }

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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

// CORS响应头
function setCorsHeaders(response) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    return response;
}

// 主要的配置请求处理器
export async function handleConfigRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    try {
        // 验证身份
        if (!validateAuth(request, env)) {
            return setCorsHeaders(new Response(JSON.stringify({ 
                error: 'Unauthorized',
                message: 'Invalid credentials'
            }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            }));
        }

        // 路由处理
        if (pathname.match(/\/api\/config\/[^\/]+$/)) {
            const configKey = pathname.split('/').pop();
            
            if (method === 'GET') {
                return await handleGetConfig(configKey, env);
            } else if (method === 'PUT') {
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
        console.error('Config API Error:', error);
        return setCorsHeaders(new Response(JSON.stringify({ 
            error: 'Internal Server Error',
            message: error.message
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }));
    }
}

// 获取配置
async function handleGetConfig(configKey, env) {
    try {
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

// 保存配置
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

        // 保存到KV
        try {
            await env.stella.put(kvKey, JSON.stringify(configData));
            kvSuccess = true;
        } catch (error) {
            kvError = error.message;
            console.error('KV save error:', error);
        }

        // 同步到Gitee
        try {
            await updateGiteeFile(filename, configData, `Update ${configKey} config via admin panel`, env);
            giteeSuccess = true;
        } catch (error) {
            giteeError = error.message;
            console.error('Gitee sync error:', error);
        }

        const result = {
            success: kvSuccess || giteeSuccess,
            kv: { success: kvSuccess, error: kvError },
            gitee: { success: giteeSuccess, error: giteeError },
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

// 列出配置
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

// 同步到Gitee
async function handleSyncToGitee(request, env) {
    try {
        const results = {};
        
        for (const [key, filename] of Object.entries(CONFIG_FILES)) {
            const kvKey = `config-${key}`;
            try {
                const data = await env.stella.get(kvKey);
                if (data) {
                    const configData = JSON.parse(data);
                    await updateGiteeFile(filename, configData, `Sync ${key} config to Gitee`, env);
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
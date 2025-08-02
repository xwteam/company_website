/**
 * EdgeOne Pages Functions 动态路由处理器
 * 根据EdgeOne Pages文档，使用 [...path].js 处理所有 /api/* 路径
 * 
 * 路由映射：
 * - /api/test → 测试端点
 * - /api/configs → 配置列表
 * - /api/config/{key} → 单个配置操作
 * - /api/config/sync → Gitee同步
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

// 设置CORS响应头
function setCorsHeaders(response) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    return response;
}

// 用户名密码验证（通过环境变量配置）
function validateAuth(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return false;
    }

    try {
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = atob(base64Credentials);
        const [username, password] = credentials.split(':');

        const validUsername = env.ADMIN_USERNAME;
        const validPassword = env.ADMIN_PASSWORD;

        return validUsername && validPassword && 
               username === validUsername && password === validPassword;
    } catch (error) {
        console.error('Auth validation error:', error);
        return false;
    }
}

// API密钥验证（向后兼容）
function validateApiKey(request, env) {
    const apiKey = request.headers.get('X-API-Key');
    const validKey = env.API_SECRET;
    return validKey && apiKey === validKey;
}

// Gitee API调用函数
async function updateGiteeFile(filename, content, commitMessage, env) {
    const token = env.GITEE_TOKEN;
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
            updateData.sha = currentSha;
        }

        // 发送更新请求
        const updateResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Gitee API error: ${updateResponse.status} - ${errorText}`);
        }

        return await updateResponse.json();
    } catch (error) {
        console.error('Gitee update error:', error);
        throw error;
    }
}

// 处理获取配置
async function handleGetConfig(configKey, env) {
    try {
        if (!CONFIG_FILES[configKey]) {
            return setCorsHeaders(new Response(JSON.stringify({
                error: 'Config not found',
                message: `Configuration '${configKey}' does not exist`
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            }));
        }

        // 优先从KV存储读取
        const kvValue = await env.stella.get(configKey);
        if (kvValue) {
            return setCorsHeaders(new Response(kvValue, {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }));
        }

        // 如果KV中没有，返回默认提示
        return setCorsHeaders(new Response(JSON.stringify({
            message: 'Config not found in KV storage',
            suggestion: 'Please save the config first via admin panel'
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        }));

    } catch (error) {
        console.error('Get config error:', error);
        return setCorsHeaders(new Response(JSON.stringify({
            error: 'Internal Server Error',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }));
    }
}

// 处理保存配置
async function handleSaveConfig(configKey, request, env) {
    try {
        if (!CONFIG_FILES[configKey]) {
            return setCorsHeaders(new Response(JSON.stringify({
                error: 'Config not found',
                message: `Configuration '${configKey}' does not exist`
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            }));
        }

        const configData = await request.json();

        // 保存到KV存储
        await env.stella.put(configKey, JSON.stringify(configData, null, 2));

        // 同步到Gitee
        const filename = CONFIG_FILES[configKey];
        try {
            await updateGiteeFile(filename, configData, `Update ${configKey} config via admin panel`, env);
        } catch (giteeError) {
            console.warn('Gitee sync failed, but KV saved successfully:', giteeError);
        }

        return setCorsHeaders(new Response(JSON.stringify({
            success: true,
            message: 'Configuration saved successfully',
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }));

    } catch (error) {
        console.error('Save config error:', error);
        return setCorsHeaders(new Response(JSON.stringify({
            error: 'Internal Server Error',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }));
    }
}

// 处理删除配置
async function handleDeleteConfig(configKey, env) {
    try {
        await env.stella.delete(configKey);

        return setCorsHeaders(new Response(JSON.stringify({
            success: true,
            message: 'Configuration deleted successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }));

    } catch (error) {
        console.error('Delete config error:', error);
        return setCorsHeaders(new Response(JSON.stringify({
            error: 'Internal Server Error',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }));
    }
}

// 处理配置列表
async function handleListConfigs(env) {
    try {
        const configs = {};
        
        for (const [key, filename] of Object.entries(CONFIG_FILES)) {
            try {
                const value = await env.stella.get(key);
                configs[key] = value ? JSON.parse(value) : null;
            } catch (error) {
                console.warn(`Failed to load config ${key}:`, error);
                configs[key] = null;
            }
        }

        return setCorsHeaders(new Response(JSON.stringify({
            success: true,
            configs: configs,
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }));

    } catch (error) {
        console.error('List configs error:', error);
        return setCorsHeaders(new Response(JSON.stringify({
            error: 'Internal Server Error',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }));
    }
}

// 处理Gitee同步
async function handleSyncToGitee(request, env) {
    try {
        const { configs } = await request.json();
        const results = [];

        for (const [configKey, configData] of Object.entries(configs)) {
            if (CONFIG_FILES[configKey]) {
                try {
                    const filename = CONFIG_FILES[configKey];
                    await updateGiteeFile(filename, configData, `Sync ${configKey} config`, env);
                    results.push({ config: configKey, status: 'success' });
                } catch (error) {
                    results.push({ config: configKey, status: 'error', error: error.message });
                }
            }
        }

        return setCorsHeaders(new Response(JSON.stringify({
            success: true,
            message: 'Gitee sync completed',
            results: results
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }));

    } catch (error) {
        console.error('Gitee sync error:', error);
        return setCorsHeaders(new Response(JSON.stringify({
            error: 'Internal Server Error',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }));
    }
}

// EdgeOne Pages Functions 动态路由入口
export async function onRequest(context) {
    const { request, env, params } = context;
    const url = new URL(request.url);
    const method = request.method;
    
    // 从动态路由参数中获取路径
    const pathSegments = params.path || [];
    const pathname = '/api/' + pathSegments.join('/');

    console.log('Dynamic router - Method:', method, 'Path:', pathname, 'Segments:', pathSegments);

    // 处理CORS预检请求
    if (method === 'OPTIONS') {
        return setCorsHeaders(new Response(null, { status: 200 }));
    }

    try {
        // 验证身份（支持用户名密码或API密钥）
        if (!validateAuth(request, env) && !validateApiKey(request, env)) {
            return setCorsHeaders(new Response(JSON.stringify({ 
                error: 'Unauthorized',
                message: 'Invalid credentials'
            }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            }));
        }

        // 路由处理
        if (pathSegments.length === 0) {
            // /api/
            return setCorsHeaders(new Response(JSON.stringify({
                message: 'EdgeOne Pages Functions API',
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                availableEndpoints: [
                    '/api/test',
                    '/api/configs',
                    '/api/config/{key}',
                    '/api/config/sync'
                ]
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }));
        } else if (pathSegments[0] === 'test') {
            // /api/test
            return setCorsHeaders(new Response(JSON.stringify({
                success: true,
                message: 'EdgeOne Functions API 工作正常！',
                timestamp: new Date().toISOString(),
                environment: 'EdgeOne Pages Functions',
                version: '2.0.0',
                dynamicRouter: true
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }));
        } else if (pathSegments[0] === 'configs') {
            // /api/configs
            if (method === 'GET') {
                return await handleListConfigs(env);
            }
        } else if (pathSegments[0] === 'config') {
            if (pathSegments.length === 2) {
                const configKey = pathSegments[1];
                
                if (configKey === 'sync') {
                    // /api/config/sync
                    return await handleSyncToGitee(request, env);
                } else {
                    // /api/config/{key}
                    if (method === 'GET') {
                        return await handleGetConfig(configKey, env);
                    } else if (method === 'POST' || method === 'PUT') {
                        return await handleSaveConfig(configKey, request, env);
                    } else if (method === 'DELETE') {
                        return await handleDeleteConfig(configKey, env);
                    }
                }
            }
        }

        // 404 - 路径未找到
        return setCorsHeaders(new Response(JSON.stringify({ 
            error: 'API路径未找到',
            path: pathname,
            segments: pathSegments,
            availablePaths: [
                '/api/test',
                '/api/configs',
                '/api/config/{key}',
                '/api/config/sync'
            ]
        }), { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        }));

    } catch (error) {
        console.error('API Error:', error);
        return setCorsHeaders(new Response(JSON.stringify({ 
            error: 'Internal Server Error',
            message: error.message,
            path: pathname
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }));
    }
}
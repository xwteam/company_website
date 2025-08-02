/**
 * EdgeOne Pages Functions 动态路由处理器 - 简化调试版本
 * 用于确定EdgeOne Pages的确切参数传递方式
 */

// Gitee API配置
const GITEE_CONFIG = {
    username: 'xwteam',
    repo: 'company_website',
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

// Base64解码函数（EdgeOne Functions兼容）
function base64Decode(str) {
    try {
        if (typeof atob !== 'undefined') {
            return atob(str);
        }
        
        // 手动实现Base64解码
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let result = '';
        let i = 0;
        
        str = str.replace(/[^A-Za-z0-9+/]/g, '');
        
        while (i < str.length) {
            const encoded1 = chars.indexOf(str.charAt(i++));
            const encoded2 = chars.indexOf(str.charAt(i++));
            const encoded3 = chars.indexOf(str.charAt(i++));
            const encoded4 = chars.indexOf(str.charAt(i++));
            
            const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
            
            result += String.fromCharCode((bitmap >> 16) & 255);
            if (encoded3 !== 64 && encoded3 !== -1) {
                result += String.fromCharCode((bitmap >> 8) & 255);
            }
            if (encoded4 !== 64 && encoded4 !== -1) {
                result += String.fromCharCode(bitmap & 255);
            }
        }
        
        return result;
    } catch (error) {
        console.error('Base64 decode error:', error);
        throw error;
    }
}

// 用户名密码验证
function validateAuth(request, env) {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return false;
    }

    try {
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = base64Decode(base64Credentials);
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

// EdgeOne Pages Functions 动态路由入口
export async function onRequest(context) {
    const { request, env, params } = context;
    const url = new URL(request.url);
    const method = request.method;
    
    // 详细的路径解析调试
    console.log('=== EdgeOne Functions Debug ===');
    console.log('Full context:', JSON.stringify({
        url: url.href,
        pathname: url.pathname,
        method: method,
        params: params
    }));
    
    // 处理CORS预检请求
    if (method === 'OPTIONS') {
        return setCorsHeaders(new Response(null, { status: 200 }));
    }

    // 解析路径 - 直接从URL解析，不依赖params
    const fullPath = url.pathname;
    let pathAfterApi = '';
    let segments = [];
    
    if (fullPath.startsWith('/api/')) {
        pathAfterApi = fullPath.substring(5); // 移除 '/api/'
        if (pathAfterApi) {
            segments = pathAfterApi.split('/').filter(s => s.length > 0);
        }
    }
    
    console.log('Path parsing:', {
        fullPath: fullPath,
        pathAfterApi: pathAfterApi,
        segments: segments,
        segmentCount: segments.length
    });

    try {
        // 处理无需认证的端点
        if (segments.length === 1 && segments[0] === 'debug') {
            console.log('Processing /api/debug endpoint');
            return setCorsHeaders(new Response(JSON.stringify({
                success: true,
                message: '调试端点工作正常！',
                timestamp: new Date().toISOString(),
                debug: {
                    url: url.href,
                    pathname: url.pathname,
                    method: method,
                    params: params,
                    pathAfterApi: pathAfterApi,
                    segments: segments,
                    segmentCount: segments.length
                },
                environment: {
                    adminUsername: env.ADMIN_USERNAME ? 'Set' : 'Missing',
                    adminPassword: env.ADMIN_PASSWORD ? 'Set' : 'Missing',
                    giteeToken: env.GITEE_TOKEN ? 'Set' : 'Missing'
                },
                request: {
                    hasAuthHeader: request.headers.get('Authorization') ? true : false,
                    authHeaderType: request.headers.get('Authorization') ? 
                        request.headers.get('Authorization').split(' ')[0] : 'None'
                }
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }));
        }
        
        if (segments.length === 1 && segments[0] === 'test') {
            console.log('Processing /api/test endpoint (no auth required)');
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
        }
        
        // 处理根路径（无需认证）
        if (segments.length === 0) {
            console.log('Processing /api/ root endpoint');
            return setCorsHeaders(new Response(JSON.stringify({
                message: 'EdgeOne Pages Functions API',
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                availableEndpoints: [
                    '/api/test',
                    '/api/debug',
                    '/api/configs',
                    '/api/config/{key}',
                    '/api/config/sync'
                ],
                debug: {
                    receivedPath: fullPath,
                    parsedSegments: segments
                }
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }));
        }

        // 验证身份（对于需要认证的端点）
        console.log('Checking authentication for:', segments);
        if (!validateAuth(request, env) && !validateApiKey(request, env)) {
            console.log('Authentication failed');
            return setCorsHeaders(new Response(JSON.stringify({ 
                error: 'Unauthorized',
                message: 'Invalid credentials',
                debug: {
                    path: fullPath,
                    segments: segments,
                    hasAuthHeader: request.headers.get('Authorization') ? true : false
                }
            }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            }));
        }

        console.log('Authentication successful');

        // 处理需要认证的端点
        
        if (segments.length === 1 && segments[0] === 'configs') {
            console.log('Processing /api/configs endpoint');
            // 简化的配置列表返回
            return setCorsHeaders(new Response(JSON.stringify({
                success: true,
                message: 'Configs endpoint working',
                timestamp: new Date().toISOString(),
                configs: CONFIG_FILES
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }));
        }
        
        if (segments.length === 2 && segments[0] === 'config') {
            const configKey = segments[1];
            console.log('Processing /api/config/' + configKey + ' endpoint');
            
            // 检查配置键是否有效
            if (!CONFIG_FILES[configKey]) {
                return setCorsHeaders(new Response(JSON.stringify({
                    success: false,
                    error: 'Invalid config key',
                    message: `配置键 '${configKey}' 不存在`,
                    availableKeys: Object.keys(CONFIG_FILES)
                }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                }));
            }
            
            try {
                // 从KV存储获取配置
                const configData = await env.stella.get(configKey);
                
                if (configData) {
                    return setCorsHeaders(new Response(JSON.stringify({
                        success: true,
                        configKey: configKey,
                        data: JSON.parse(configData),
                        source: 'KV Storage',
                        timestamp: new Date().toISOString()
                    }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    }));
                } else {
                    return setCorsHeaders(new Response(JSON.stringify({
                        success: false,
                        error: 'Config not found',
                        message: `配置 '${configKey}' 在KV存储中不存在`,
                        configKey: configKey
                    }), {
                        status: 404,
                        headers: { 'Content-Type': 'application/json' }
                    }));
                }
            } catch (error) {
                console.error('KV read error:', error);
                return setCorsHeaders(new Response(JSON.stringify({
                    success: false,
                    error: 'KV Storage Error',
                    message: `读取配置失败: ${error.message}`,
                    configKey: configKey
                }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }));
            }
        }

        // 404 - 路径未找到
        console.log('No matching endpoint for:', segments);
        return setCorsHeaders(new Response(JSON.stringify({ 
            error: 'API路径未找到',
            path: fullPath,
            segments: segments,
            availablePaths: [
                '/api/test',
                '/api/debug',
                '/api/configs',
                '/api/config/{key}'
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
            path: fullPath
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }));
    }
}
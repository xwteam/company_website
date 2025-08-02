/**
 * EdgeOne Functions - 简单认证API
 * 用于验证管理员登录凭据
 */

// 设置CORS响应头
function setCorsHeaders(response) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}

// Base64解码函数
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

// 验证用户凭据
function validateCredentials(username, password, env) {
    const validUsername = env.ADMIN_USERNAME;
    const validPassword = env.ADMIN_PASSWORD;
    
    console.log('Validating credentials:', {
        providedUsername: username,
        providedPasswordLength: password ? password.length : 0,
        envUsernameSet: !!validUsername,
        envPasswordSet: !!validPassword
    });
    
    return validUsername && validPassword && 
           username === validUsername && password === validPassword;
}

// 处理认证请求
export async function onRequest(context) {
    const { request, env } = context;
    const method = request.method;
    
    console.log('Auth API called:', method);
    
    // 处理CORS预检请求
    if (method === 'OPTIONS') {
        return setCorsHeaders(new Response(null, { status: 200 }));
    }
    
    try {
        if (method === 'POST') {
            // 处理JSON格式的登录请求
            const body = await request.json();
            const { username, password } = body;
            
            if (!username || !password) {
                return setCorsHeaders(new Response(JSON.stringify({
                    success: false,
                    message: '用户名和密码不能为空'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }));
            }
            
            const isValid = validateCredentials(username, password, env);
            
            if (isValid) {
                return setCorsHeaders(new Response(JSON.stringify({
                    success: true,
                    message: '登录成功',
                    user: username,
                    timestamp: new Date().toISOString()
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }));
            } else {
                return setCorsHeaders(new Response(JSON.stringify({
                    success: false,
                    message: '用户名或密码错误'
                }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }));
            }
            
        } else if (method === 'GET') {
            // 处理Basic Auth格式的验证请求
            const authHeader = request.headers.get('Authorization');
            
            if (!authHeader || !authHeader.startsWith('Basic ')) {
                return setCorsHeaders(new Response(JSON.stringify({
                    success: false,
                    message: '缺少认证信息'
                }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }));
            }
            
            try {
                const base64Credentials = authHeader.split(' ')[1];
                const credentials = base64Decode(base64Credentials);
                const [username, password] = credentials.split(':');
                
                const isValid = validateCredentials(username, password, env);
                
                if (isValid) {
                    return setCorsHeaders(new Response(JSON.stringify({
                        success: true,
                        message: '认证通过',
                        user: username,
                        timestamp: new Date().toISOString()
                    }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    }));
                } else {
                    return setCorsHeaders(new Response(JSON.stringify({
                        success: false,
                        message: '认证失败'
                    }), {
                        status: 401,
                        headers: { 'Content-Type': 'application/json' }
                    }));
                }
                
            } catch (error) {
                console.error('Auth parsing error:', error);
                return setCorsHeaders(new Response(JSON.stringify({
                    success: false,
                    message: '认证格式错误'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }));
            }
        }
        
        // 不支持的方法
        return setCorsHeaders(new Response(JSON.stringify({
            success: false,
            message: '不支持的请求方法'
        }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        }));
        
    } catch (error) {
        console.error('Auth API error:', error);
        return setCorsHeaders(new Response(JSON.stringify({
            success: false,
            message: '服务器内部错误'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }));
    }
}
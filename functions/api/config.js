// EdgeOne Functions - 配置管理API
export async function onRequestPost({ request, env }) {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        const { action } = await request.json();

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

        // 根据action返回配置
        if (action === 'getGiteeConfig') {
            return new Response(JSON.stringify({
                success: true,
                config: {
                    username: env.GITEE_USERNAME,
                    repo: env.GITEE_REPO,
                    token: env.GITEE_TOKEN
                }
            }), { status: 200, headers });
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
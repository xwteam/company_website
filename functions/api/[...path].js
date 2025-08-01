// 通用API路由处理器
// 这个文件处理所有 /api/ 开头的请求

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // CORS处理
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Content-Type': 'application/json'
    };
    
    if (request.method === 'OPTIONS') {
        return new Response(null, { 
            status: 200, 
            headers: corsHeaders 
        });
    }
    
    try {
        // 如果是配置API路径，导入配置处理器
        if (pathname.startsWith('/api/config')) {
            const { handleConfigRequest } = await import('./config-handler.js');
            return await handleConfigRequest(context);
        }
        
        // 默认响应
        return new Response(JSON.stringify({
            error: 'API路径未找到',
            path: pathname,
            availablePaths: ['/api/config/*', '/api/test']
        }), {
            status: 404,
            headers: corsHeaders
        });
        
    } catch (error) {
        console.error('API错误:', error);
        return new Response(JSON.stringify({
            error: 'API处理失败',
            message: error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
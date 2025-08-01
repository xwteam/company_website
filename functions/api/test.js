// 简单的测试API，用于验证Functions是否正常工作
export async function onRequest(context) {
    const { request } = context;
    
    // CORS处理
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };
    
    if (request.method === 'OPTIONS') {
        return new Response(null, { 
            status: 200, 
            headers: corsHeaders 
        });
    }
    
    try {
        const response = {
            success: true,
            message: 'EdgeOne Functions API 工作正常！',
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url
        };
        
        return new Response(JSON.stringify(response, null, 2), {
            status: 200,
            headers: corsHeaders
        });
        
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
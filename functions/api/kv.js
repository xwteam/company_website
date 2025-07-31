export async function onRequest({ request, env }) {
  // 解析请求URL和方法
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname.split('/').filter(Boolean);
  
  // 定义标准响应头
  const standardHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
  
  // 处理OPTIONS请求（CORS预检）
  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: standardHeaders
    });
  }

  // 确保stella KV命名空间存在
  if (!env.stella) {
    console.error('KV命名空间未绑定');
    return new Response(JSON.stringify({ 
      error: 'KV命名空间未绑定',
      message: '请确保在EdgeOne Pages项目中绑定了名为"stella"的KV命名空间'
    }), {
      status: 500,
      headers: standardHeaders
    });
  }

  // 处理API请求
  try {
    // 获取KV值
    if (method === 'GET') {
      const key = path[1]; // 路径格式: /api/kv/{key}
      
      if (!key) {
        // 如果没有指定key，则列出所有键
        const keys = await env.stella.list();
        
        return new Response(JSON.stringify({ keys: keys.keys }), {
          headers: standardHeaders
        });
      } else {
        // 获取指定key的值
        const value = await env.stella.get(key);
        
        return new Response(JSON.stringify({ key, value }), {
          headers: standardHeaders
        });
      }
    }
    
    // 设置KV值
    if (method === 'PUT') {
      const key = path[1]; // 路径格式: /api/kv/{key}
      if (!key) {
        return new Response(JSON.stringify({ error: '缺少键名' }), {
          status: 400,
          headers: standardHeaders
        });
      }
      
      // 解析请求体
      const contentType = request.headers.get('content-type') || '';
      let value;
      
      if (contentType.includes('application/json')) {
        const body = await request.json();
        value = body.value;
      } else {
        const text = await request.text();
        try {
          const body = JSON.parse(text);
          value = body.value;
        } catch (e) {
          value = text;
        }
      }
      
      // 写入KV存储
      await env.stella.put(key, value);
      
      return new Response(JSON.stringify({ success: true, key }), {
        headers: standardHeaders
      });
    }
    
    // 删除KV值
    if (method === 'DELETE') {
      const key = path[1]; // 路径格式: /api/kv/{key}
      if (!key) {
        return new Response(JSON.stringify({ error: '缺少键名' }), {
          status: 400,
          headers: standardHeaders
        });
      }
      
      // 删除KV存储中的键
      await env.stella.delete(key);
      
      return new Response(JSON.stringify({ success: true, key }), {
        headers: standardHeaders
      });
    }
    
    // 不支持的方法
    return new Response(JSON.stringify({ error: '不支持的方法' }), {
      status: 405,
      headers: {
        ...standardHeaders,
        'Allow': 'GET, PUT, DELETE, OPTIONS'
      }
    });
    
  } catch (error) {
    console.error('KV API错误:', error);
    return new Response(JSON.stringify({ 
      error: '处理请求时出错', 
      message: error.message
    }), {
      status: 500,
      headers: standardHeaders
    });
  }
} 
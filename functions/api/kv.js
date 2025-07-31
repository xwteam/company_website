// 全局内存缓存，用于确保同一个服务器实例上的请求能获取到一致的数据
const memoryCache = {};

export async function onRequest({ request, env }) {
  // 解析请求URL和方法
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname.split('/').filter(Boolean);
  
  // 检查是否请求强制一致性
  const forceConsistency = url.searchParams.has('force_consistency');
  
  // 检查是否请求清除缓存
  const clearCache = url.searchParams.has('clear_cache');
  if (clearCache) {
    // 清除内存缓存
    for (const key in memoryCache) {
      delete memoryCache[key];
    }
  }
  
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
        let value;
        
        // 如果强制一致性或者缓存中没有该键，则从KV存储读取
        if (forceConsistency || !memoryCache[key] || (Date.now() - memoryCache[key].timestamp) > 60000) {
          // 如果请求强制一致性，使用强一致性读取选项
          const options = forceConsistency ? { type: "text", cacheTtl: 0 } : undefined;
          value = await env.stella.get(key, options);
          
          // 更新内存缓存
          memoryCache[key] = {
            value: value,
            timestamp: Date.now()
          };
        } else {
          // 从内存缓存读取
          value = memoryCache[key].value;
        }
        
        return new Response(JSON.stringify({ 
          key, 
          value,
          from_cache: !forceConsistency && memoryCache[key] && (Date.now() - memoryCache[key].timestamp) <= 60000,
          consistency: forceConsistency ? 'strong' : 'eventual',
          timestamp: Date.now(),
          cache_timestamp: memoryCache[key] ? memoryCache[key].timestamp : null
        }), {
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
      
      // 更新内存缓存
      memoryCache[key] = {
        value: value,
        timestamp: Date.now()
      };
      
      // 强制读取一次，确保数据已写入
      if (forceConsistency) {
        await env.stella.get(key, { type: "text", cacheTtl: 0 });
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        key,
        timestamp: Date.now()
      }), {
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
      
      // 删除内存缓存中的键
      if (memoryCache[key]) {
        delete memoryCache[key];
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        key,
        timestamp: Date.now()
      }), {
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
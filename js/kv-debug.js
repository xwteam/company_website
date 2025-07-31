/**
 * EdgeOne KV存储调试脚本
 * 用于诊断KV存储的问题
 */

// 在页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 创建调试面板
    createDebugPanel();
    
    // 检查KV存储状态
    checkKVStatus();
});

// 创建调试面板
function createDebugPanel() {
    // 创建调试面板容器
    const debugPanel = document.createElement('div');
    debugPanel.id = 'kv-debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        max-height: 400px;
        overflow-y: auto;
        background-color: rgba(0, 0, 0, 0.8);
        color: #fff;
        padding: 15px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    `;
    
    // 创建标题
    const title = document.createElement('h3');
    title.textContent = 'KV存储调试面板';
    title.style.cssText = `
        margin: 0 0 10px 0;
        padding-bottom: 5px;
        border-bottom: 1px solid #555;
    `;
    debugPanel.appendChild(title);
    
    // 创建状态区域
    const statusArea = document.createElement('div');
    statusArea.id = 'kv-status-area';
    statusArea.innerHTML = '<p>正在检查KV存储状态...</p>';
    debugPanel.appendChild(statusArea);
    
    // 创建操作按钮区域
    const actionArea = document.createElement('div');
    actionArea.style.marginTop = '15px';
    
    // 刷新按钮
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = '刷新状态';
    refreshBtn.style.cssText = `
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 5px 10px;
        margin-right: 10px;
        border-radius: 3px;
        cursor: pointer;
    `;
    refreshBtn.onclick = checkKVStatus;
    actionArea.appendChild(refreshBtn);
    
    // 清除缓存按钮
    const clearCacheBtn = document.createElement('button');
    clearCacheBtn.textContent = '清除缓存';
    clearCacheBtn.style.cssText = `
        background-color: #f44336;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
    `;
    clearCacheBtn.onclick = clearBrowserCache;
    actionArea.appendChild(clearCacheBtn);
    
    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: transparent;
        color: #ccc;
        border: none;
        cursor: pointer;
        font-size: 16px;
    `;
    closeBtn.onclick = function() {
        document.body.removeChild(debugPanel);
    };
    debugPanel.appendChild(closeBtn);
    
    debugPanel.appendChild(actionArea);
    
    // 添加到页面
    document.body.appendChild(debugPanel);
}

// 检查KV存储状态
async function checkKVStatus() {
    const statusArea = document.getElementById('kv-status-area');
    statusArea.innerHTML = '<p>正在检查KV存储状态...</p>';
    
    try {
        // 检查stella对象是否存在
        if (typeof stella === 'undefined') {
            statusArea.innerHTML = `
                <p style="color: #f44336;">错误: stella对象未定义</p>
                <p>可能原因:</p>
                <ul>
                    <li>KV存储未正确绑定到EdgeOne Pages项目</li>
                    <li>命名空间名称不是"stella"</li>
                    <li>网站不是在EdgeOne Pages环境中运行</li>
                </ul>
                <p>解决方案:</p>
                <ul>
                    <li>确认在EdgeOne Pages中已正确绑定KV存储命名空间</li>
                    <li>检查命名空间名称是否为"stella"</li>
                    <li>确保网站部署在EdgeOne Pages环境中</li>
                </ul>
            `;
            return;
        }
        
        // 检查stella是否是模拟对象
        const isMock = stella.toString().includes('模拟');
        
        if (isMock) {
            statusArea.innerHTML = `
                <p style="color: #ff9800;">警告: 当前使用的是模拟KV存储API</p>
                <p>这意味着您的网站可能在以下环境中运行:</p>
                <ul>
                    <li>本地开发环境</li>
                    <li>非EdgeOne Pages环境</li>
                    <li>EdgeOne Pages环境，但KV存储未正确绑定</li>
                </ul>
                <p>解决方案:</p>
                <ul>
                    <li>确认在EdgeOne Pages中已正确绑定KV存储命名空间</li>
                    <li>检查命名空间名称是否为"stella"</li>
                    <li>确保网站部署在EdgeOne Pages环境中</li>
                </ul>
            `;
        } else {
            statusArea.innerHTML = `
                <p style="color: #4CAF50;">成功: 已连接到EdgeOne KV存储</p>
            `;
        }
        
        // 尝试获取KV存储中的数据
        statusArea.innerHTML += '<p>正在检查KV存储中的数据...</p>';
        
        try {
            // 获取hero背景
            const heroBg = await stella.get('hero-bg', 'text');
            // 获取hero标题
            const heroTitle = await stella.get('hero-content-title', 'text');
            // 获取hero描述
            const heroDesc = await stella.get('hero-content-description', 'text');
            // 获取服务描述
            const servicesDesc = await stella.get('services-description', 'json');
            // 获取精选产品描述
            const featuredProductsDesc = await stella.get('featured-products-description', 'text');
            // 获取客户评价
            const testimonialsDesc = await stella.get('testimonials-description', 'json');
            
            // 显示数据状态
            statusArea.innerHTML += `
                <p>数据状态:</p>
                <ul>
                    <li>hero-bg: ${heroBg ? '✅ 已存在' : '❌ 不存在'}</li>
                    <li>hero-content-title: ${heroTitle ? '✅ 已存在' : '❌ 不存在'}</li>
                    <li>hero-content-description: ${heroDesc ? '✅ 已存在' : '❌ 不存在'}</li>
                    <li>services-description: ${servicesDesc ? '✅ 已存在' : '❌ 不存在'}</li>
                    <li>featured-products-description: ${featuredProductsDesc ? '✅ 已存在' : '❌ 不存在'}</li>
                    <li>testimonials-description: ${testimonialsDesc ? '✅ 已存在' : '❌ 不存在'}</li>
                </ul>
            `;
            
            // 检查是否有数据缺失
            if (!heroBg || !heroTitle || !heroDesc || !servicesDesc || !featuredProductsDesc || !testimonialsDesc) {
                statusArea.innerHTML += `
                    <p style="color: #f44336;">警告: 部分数据缺失</p>
                    <p>解决方案:</p>
                    <ul>
                        <li>访问<a href="admin.html" style="color: #2196F3;">管理页面</a>，初始化配置</li>
                        <li>检查KV存储权限是否正确</li>
                    </ul>
                `;
            } else {
                statusArea.innerHTML += `
                    <p style="color: #4CAF50;">所有数据已正确加载</p>
                `;
            }
            
            // 添加刷新页面按钮
            statusArea.innerHTML += `
                <p>如果您已经在管理页面更新了配置，请尝试:</p>
                <button onclick="window.location.reload(true)" style="background-color: #2196F3; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">强制刷新页面</button>
            `;
            
        } catch (error) {
            statusArea.innerHTML += `
                <p style="color: #f44336;">获取数据时出错: ${error.message}</p>
            `;
        }
        
    } catch (error) {
        statusArea.innerHTML = `
            <p style="color: #f44336;">检查KV存储状态时出错: ${error.message}</p>
        `;
    }
}

// 清除浏览器缓存
function clearBrowserCache() {
    const statusArea = document.getElementById('kv-status-area');
    statusArea.innerHTML = '<p>正在尝试清除缓存...</p>';
    
    try {
        // 清除localStorage
        localStorage.clear();
        
        // 尝试清除缓存的资源
        if ('caches' in window) {
            caches.keys().then(function(names) {
                for (let name of names) {
                    caches.delete(name);
                }
                statusArea.innerHTML = '<p style="color: #4CAF50;">缓存已清除，正在刷新页面...</p>';
                setTimeout(() => {
                    window.location.reload(true);
                }, 1000);
            });
        } else {
            statusArea.innerHTML = '<p>缓存API不可用，请手动清除浏览器缓存</p>';
            setTimeout(() => {
                window.location.reload(true);
            }, 1000);
        }
    } catch (error) {
        statusArea.innerHTML = `<p style="color: #f44336;">清除缓存时出错: ${error.message}</p>`;
    }
} 
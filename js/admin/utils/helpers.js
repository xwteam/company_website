/**
 * 表单辅助生成器
 * 提供常用的表单元素生成函数
 */

// 生成基础服务项目
window.generateServiceItems = function(items) {
    return items.map((item, index) => `
        <div class="array-item" data-index="${index}">
            <div class="item-controls">
                <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="item-content">
                <label>图标 (FontAwesome类名)</label>
                <input type="text" name="services-description.items[${index}].icon" value="${item.icon || ''}" placeholder="fas fa-cog">
                
                <label>标题</label>
                <input type="text" name="services-description.items[${index}].title" value="${item.title || ''}" placeholder="服务标题">
                
                <label>描述</label>
                <textarea name="services-description.items[${index}].description" rows="2" placeholder="服务描述">${item.description || ''}</textarea>
            </div>
        </div>
    `).join('');
};

// 生成客户评价项目
window.generateTestimonialItems = function(items) {
    return items.map((item, index) => `
        <div class="array-item" data-index="${index}">
            <div class="item-controls">
                <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="item-content">
                <label>客户姓名</label>
                <input type="text" name="testimonials-description.items[${index}].name" value="${item.name || ''}" placeholder="客户姓名">
                
                <label>客户头像</label>
                <input type="url" name="testimonials-description.items[${index}].avatar" value="${item.avatar || ''}" placeholder="头像URL">
                
                <label>客户职位</label>
                <input type="text" name="testimonials-description.items[${index}].role" value="${item.role || ''}" placeholder="职位/公司">
                
                <label>评价内容</label>
                <textarea name="testimonials-description.items[${index}].content" rows="3" placeholder="客户评价">${item.content || ''}</textarea>
                
                <label>评分 (1-5)</label>
                <input type="number" name="testimonials-description.items[${index}].rating" value="${item.rating || 5}" min="1" max="5">
            </div>
        </div>
    `).join('');
};

// 生成筛选项目
window.generateFilterItems = function(items) {
    return items.map((item, index) => `
        <div class="array-item collapsible" data-index="${index}">
            <div class="item-controls">
                <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                    <i class="fas fa-chevron-down"></i>
                </button>
                <span class="item-title">分类 #${index + 1}: ${item.label || '新分类'}</span>
                <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="item-content">
                <label>分类名称 (名称和值会自动同步)</label>
                <input type="text" name="filters[${index}].label" value="${item.label || ''}" placeholder="分类名称" onchange="syncFilterValue(this); updateItemTitle(this);">
                
                <input type="hidden" name="filters[${index}].value" value="${item.value || ''}" class="filter-value-hidden">
            </div>
        </div>
    `).join('');
};

// 生成产品项目
window.generateProductItems = function(items) {
    return items.map((item, index) => `
        <div class="array-item collapsible" data-index="${index}">
            <div class="item-controls">
                <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                    <i class="fas fa-chevron-down"></i>
                </button>
                <span class="item-title">产品 #${index + 1}: ${item.title || '新产品'}</span>
                <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="item-content">
                <label>产品ID (时间戳)</label>
                <input type="text" name="products[${index}].item" value="${item.item || Date.now()}" readonly>
                
                <label>产品名称</label>
                <input type="text" name="products[${index}].title" value="${item.title || ''}" placeholder="产品名称" onchange="updateItemTitle(this)">
                
                <label>产品分类</label>
                <input type="text" name="products[${index}].category" value="${item.category || ''}" placeholder="产品分类">
                
                <label>产品图片</label>
                <input type="url" name="products[${index}].image" value="${item.image || ''}" placeholder="产品图片URL">
                
                <label>产品描述</label>
                <textarea name="products[${index}].description" rows="2" placeholder="产品描述">${item.description || ''}</textarea>
            </div>
        </div>
    `).join('');
};

// 生成详细服务项目
window.generateDetailedServiceItems = function(items) {
    return items.map((item, index) => `
        <div class="array-item" data-index="${index}">
            <div class="item-controls">
                <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="item-content">
                <label>服务名称</label>
                <input type="text" name="services[${index}].title" value="${item.title || ''}" placeholder="服务名称">
                
                <label>服务图标</label>
                <input type="text" name="services[${index}].icon" value="${item.icon || ''}" placeholder="fas fa-cog">
                
                <label>服务描述</label>
                <textarea name="services[${index}].description" rows="2" placeholder="服务描述">${item.description || ''}</textarea>
                
                <label>服务特色 (逗号分隔)</label>
                <input type="text" name="services[${index}].features" value="${(item.features || []).join(', ')}" placeholder="特色1, 特色2, 特色3">
            </div>
        </div>
    `).join('');
};

// 生成社交链接
window.generateSocialLinks = function(items) {
    return items.map((item, index) => `
        <div class="array-item" data-index="${index}">
            <div class="item-controls">
                <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="item-content">
                <label>平台名称</label>
                <input type="text" name="social.links[${index}].name" value="${item.name || ''}" placeholder="Facebook">
                
                <label>图标</label>
                <input type="text" name="social.links[${index}].icon" value="${item.icon || ''}" placeholder="fab fa-facebook">
                
                <label>链接</label>
                <input type="url" name="social.links[${index}].url" value="${item.url || ''}" placeholder="https://facebook.com/yourpage">
            </div>
        </div>
    `).join('');
};

// 生成导航链接
window.generateNavigationLinks = function(items) {
    return items.map((item, index) => `
        <div class="array-item" data-index="${index}">
            <div class="item-controls">
                <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="item-content">
                <label>链接文本</label>
                <input type="text" name="links.navigation[${index}].text" value="${item.text || ''}" placeholder="首页">
                
                <label>链接地址</label>
                <input type="text" name="links.navigation[${index}].url" value="${item.url || ''}" placeholder="index.html">
            </div>
        </div>
    `).join('');
};

// 生成服务链接
window.generateServiceLinks = function(items) {
    return items.map((item, index) => `
        <div class="array-item" data-index="${index}">
            <div class="item-controls">
                <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="item-content">
                <label>服务名称</label>
                <input type="text" name="links.services[${index}].text" value="${item.text || ''}" placeholder="服务名称">
                
                <label>服务链接</label>
                <input type="text" name="links.services[${index}].url" value="${item.url || ''}" placeholder="services.html">
            </div>
        </div>
    `).join('');
};

// 生成法律链接
window.generateLegalLinks = function(items) {
    return items.map((item, index) => `
        <div class="array-item" data-index="${index}">
            <div class="item-controls">
                <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="item-content">
                <label>链接名称</label>
                <input type="text" name="legal.links[${index}].text" value="${item.text || ''}" placeholder="隐私政策">
                
                <label>链接地址</label>
                <input type="text" name="legal.links[${index}].url" value="${item.url || ''}" placeholder="privacy.html">
            </div>
        </div>
    `).join('');
};
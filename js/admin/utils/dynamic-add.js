/**
 * 动态添加项目功能模块
 */

// 添加服务项目
window.addServiceItem = function(button) {
    const container = button.previousElementSibling;
    const index = container.children.length;
    const newItem = document.createElement('div');
    newItem.className = 'array-item';
    newItem.innerHTML = `
        <div class="item-controls">
            <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="item-content">
            <label>图标 (FontAwesome类名)</label>
            <input type="text" name="services-description.items[${index}].icon" placeholder="fas fa-cog">
            
            <label>标题</label>
            <input type="text" name="services-description.items[${index}].title" placeholder="服务标题">
            
            <label>描述</label>
            <textarea name="services-description.items[${index}].description" rows="2" placeholder="服务描述"></textarea>
        </div>
    `;
    container.appendChild(newItem);
};

// 添加客户评价项目
window.addTestimonialItem = function(button) {
    const container = button.previousElementSibling;
    const index = container.children.length;
    const newItem = document.createElement('div');
    newItem.className = 'array-item';
    newItem.innerHTML = `
        <div class="item-controls">
            <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="item-content">
            <label>客户姓名</label>
            <input type="text" name="testimonials-description.items[${index}].name" placeholder="客户姓名">
            
            <label>客户头像</label>
            <input type="url" name="testimonials-description.items[${index}].avatar" placeholder="头像URL">
            
            <label>客户职位</label>
            <input type="text" name="testimonials-description.items[${index}].role" placeholder="职位/公司">
            
            <label>评价内容</label>
            <textarea name="testimonials-description.items[${index}].content" rows="3" placeholder="客户评价"></textarea>
            
            <label>评分 (1-5)</label>
            <input type="number" name="testimonials-description.items[${index}].rating" value="5" min="1" max="5">
        </div>
    `;
    container.appendChild(newItem);
};

// 添加筛选项目
window.addFilterItem = function(button) {
    const container = button.previousElementSibling;
    const index = container.children.length;
    const newItem = document.createElement('div');
    newItem.className = 'array-item collapsible';
    newItem.innerHTML = `
        <div class="item-controls">
            <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                <i class="fas fa-chevron-down"></i>
            </button>
            <span class="item-title">分类 #${index + 1}: 新分类</span>
            <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="item-content">
            <label>分类名称 (名称和值会自动同步)</label>
            <input type="text" name="filters[${index}].label" placeholder="分类名称" onchange="syncFilterValue(this); updateItemTitle(this);">
            
            <input type="hidden" name="filters[${index}].value" class="filter-value-hidden">
        </div>
    `;
    container.appendChild(newItem);
};

// 添加产品项目
window.addProductItem = function(button) {
    const container = button.previousElementSibling;
    const index = container.children.length;
    const newItem = document.createElement('div');
    newItem.className = 'array-item collapsible';
    newItem.innerHTML = `
        <div class="item-controls">
            <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                <i class="fas fa-chevron-down"></i>
            </button>
            <span class="item-title">产品 #${index + 1}: 新产品</span>
            <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="item-content">
            <label>产品ID (时间戳)</label>
            <input type="text" name="products[${index}].item" value="${Date.now()}" readonly>
            
            <label>产品名称</label>
            <input type="text" name="products[${index}].title" placeholder="产品名称" onchange="updateItemTitle(this)">
            
            <label>产品分类</label>
            <input type="text" name="products[${index}].category" placeholder="产品分类">
            
            <label>产品图片</label>
            <input type="url" name="products[${index}].image" placeholder="产品图片URL">
            
            <label>产品描述</label>
            <textarea name="products[${index}].description" rows="2" placeholder="产品描述"></textarea>
        </div>
    `;
    container.appendChild(newItem);
};
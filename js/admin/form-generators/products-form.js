/**
 * 产品配置表单生成器
 */

window.generateProductsForm = function(config) {
    return `
        <div class="form-section">
            <h3><i class="fas fa-box"></i> 产品配置</h3>
            
            <!-- 页面头部 -->
            <div class="form-group collapsible-group">
                <h4 class="group-header" onclick="toggleGroup(this)">
                    <i class="fas fa-chevron-down"></i> 页面头部
                </h4>
                <div class="group-content">
                    <label>页面标题</label>
                    <input type="text" name="page-header.title" value="${config['page-header']?.title || ''}" placeholder="产品页面标题">
                    
                    <label>页面描述</label>
                    <textarea name="page-header.description" rows="2" placeholder="页面描述">${config['page-header']?.description || ''}</textarea>
                </div>
            </div>

            <!-- 产品筛选 -->
            <div class="form-group collapsible-group">
                <h4 class="group-header" onclick="toggleGroup(this)">
                    <i class="fas fa-chevron-down"></i> 产品分类筛选
                </h4>
                <div class="group-content">
                    <div class="array-editor" data-field="filters">
                        <label>分类选项</label>
                        <div class="array-container">
                            ${window.generateFilterItems(config.filters || [])}
                        </div>
                        <button type="button" class="btn btn-secondary add-item" onclick="addFilterItem(this)">
                            <i class="fas fa-plus"></i> 添加分类
                        </button>
                    </div>
                </div>
            </div>

            <!-- 产品列表 -->
            <div class="form-group collapsible-group">
                <h4 class="group-header" onclick="toggleGroup(this)">
                    <i class="fas fa-chevron-down"></i> 产品列表
                </h4>
                <div class="group-content">
                    <div class="array-editor" data-field="products">
                        <label>产品项目</label>
                        <div class="array-container">
                            ${window.generateProductItems(config.products || [])}
                        </div>
                        <button type="button" class="btn btn-secondary add-item" onclick="addProductItem(this)">
                            <i class="fas fa-plus"></i> 添加产品
                        </button>
                    </div>
                </div>
            </div>

            <!-- 精选产品 -->
            <div class="form-group collapsible-group">
                <h4 class="group-header" onclick="toggleGroup(this)">
                    <i class="fas fa-chevron-down"></i> 精选产品
                </h4>
                <div class="group-content">
                    <label>标题</label>
                    <input type="text" name="featured-product.title" value="${config['featured-product']?.title || ''}" placeholder="精选产品标题">
                    
                    <label>产品名称</label>
                    <input type="text" name="featured-product.name" value="${config['featured-product']?.name || ''}" placeholder="精选产品名称">
                    
                    <label>产品描述</label>
                    <textarea name="featured-product.description" rows="3" placeholder="产品描述">${config['featured-product']?.description || ''}</textarea>
                    
                    <label>产品图片</label>
                    <input type="url" name="featured-product.image" value="${config['featured-product']?.image || ''}" placeholder="产品图片URL">
                    
                    <label>按钮文字</label>
                    <input type="text" name="featured-product.button.text" value="${config['featured-product']?.button?.text || ''}" placeholder="按钮文字">
                    
                    <label>按钮链接</label>
                    <input type="text" name="featured-product.button.link" value="${config['featured-product']?.button?.link || ''}" placeholder="按钮链接">
                </div>
            </div>
        </div>
    `;
};

// 注册表单生成器
if (window.configFormEditor) {
    window.configFormEditor.registerFormGenerator('products', window.generateProductsForm);
}
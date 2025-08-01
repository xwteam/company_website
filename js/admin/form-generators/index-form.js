/**
 * 首页配置表单生成器
 */

window.generateIndexForm = function(config) {
    return `
        <div class="form-section">
            <h3><i class="fas fa-home"></i> 首页配置</h3>
            
            <!-- 英雄区域 -->
            <div class="form-group">
                <h4>英雄区域</h4>
                <label>背景图片URL</label>
                <input type="url" name="hero-bg" value="${config['hero-bg'] || ''}" placeholder="例如: images/hero-bg.jpg">
                
                <label>主标题</label>
                <input type="text" name="hero-content.title" value="${config['hero-content']?.title || ''}" placeholder="网站主标题">
                
                <label>副标题</label>
                <input type="text" name="hero-content.subtitle" value="${config['hero-content']?.subtitle || ''}" placeholder="网站副标题">
                
                <label>描述文字</label>
                <textarea name="hero-content.description" rows="3" placeholder="网站描述">${config['hero-content']?.description || ''}</textarea>
                
                <label>按钮文字</label>
                <input type="text" name="hero-content.button.text" value="${config['hero-content']?.button?.text || ''}" placeholder="按钮文字">
                
                <label>按钮链接</label>
                <input type="text" name="hero-content.button.link" value="${config['hero-content']?.button?.link || ''}" placeholder="按钮链接">
            </div>

            <!-- 服务描述 -->
            <div class="form-group">
                <h4>服务描述区域</h4>
                <label>标题</label>
                <input type="text" name="services-description.title" value="${config['services-description']?.title || ''}" placeholder="服务区域标题">
                
                <label>描述</label>
                <textarea name="services-description.description" rows="3" placeholder="服务描述">${config['services-description']?.description || ''}</textarea>
                
                <div class="array-editor" data-field="services-description.items">
                    <label>服务项目</label>
                    <div class="array-container">
                        ${window.generateServiceItems(config['services-description']?.items || [])}
                    </div>
                    <button type="button" class="btn btn-secondary add-item" onclick="addServiceItem(this)">
                        <i class="fas fa-plus"></i> 添加服务项目
                    </button>
                </div>
            </div>

            <!-- 客户评价 -->
            <div class="form-group">
                <h4>客户评价区域</h4>
                <label>标题</label>
                <input type="text" name="testimonials-description.title" value="${config['testimonials-description']?.title || ''}" placeholder="客户评价标题">
                
                <label>描述</label>
                <textarea name="testimonials-description.description" rows="2" placeholder="客户评价描述">${config['testimonials-description']?.description || ''}</textarea>
                
                <div class="array-editor" data-field="testimonials-description.items">
                    <label>客户评价</label>
                    <div class="array-container">
                        ${window.generateTestimonialItems(config['testimonials-description']?.items || [])}
                    </div>
                    <button type="button" class="btn btn-secondary add-item" onclick="addTestimonialItem(this)">
                        <i class="fas fa-plus"></i> 添加客户评价
                    </button>
                </div>
            </div>

            <!-- 联系信息 -->
            <div class="form-group">
                <h4>联系信息</h4>
                <label>公司成立信息</label>
                <input type="text" name="footer-info.since" value="${config['footer-info']?.since || ''}" placeholder="例如: Creating digital experiences with purpose since 2010">
                
                <label>邮箱地址</label>
                <input type="email" name="footer-info.email" value="${config['footer-info']?.email || ''}" placeholder="hello@brand.com">
                
                <label>电话号码</label>
                <input type="tel" name="footer-info.phone" value="${config['footer-info']?.phone || ''}" placeholder="+1 (234) 567-890">
                
                <label>地址</label>
                <textarea name="footer-info.address" rows="2" placeholder="公司地址">${config['footer-info']?.address || ''}</textarea>
            </div>
        </div>
    `;
};

// 注册表单生成器
if (window.configFormEditor) {
    window.configFormEditor.registerFormGenerator('index', window.generateIndexForm);
}
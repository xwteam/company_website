/**
 * 可视化配置表单编辑器
 * 将JSON配置转换为用户友好的表单界面
 */

class ConfigFormEditor {
    constructor() {
        this.currentConfig = null;
        this.currentConfigKey = null;
        this.formValidators = {};
    }

    // 生成首页配置表单
    generateIndexForm(config) {
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
                            ${this.generateServiceItems(config['services-description']?.items || [])}
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
                            ${this.generateTestimonialItems(config['testimonials-description']?.items || [])}
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
    }

    // 生成产品配置表单
    generateProductsForm(config) {
        return `
            <div class="form-section">
                <h3><i class="fas fa-box"></i> 产品配置</h3>
                
                <!-- 页面头部 -->
                <div class="form-group">
                    <h4>页面头部</h4>
                    <label>页面标题</label>
                    <input type="text" name="page-header.title" value="${config['page-header']?.title || ''}" placeholder="产品页面标题">
                    
                    <label>页面描述</label>
                    <textarea name="page-header.description" rows="2" placeholder="页面描述">${config['page-header']?.description || ''}</textarea>
                </div>

                <!-- 产品筛选 -->
                <div class="form-group">
                    <h4>产品分类筛选</h4>
                    <div class="array-editor" data-field="filters">
                        <label>分类选项</label>
                        <div class="array-container">
                            ${this.generateFilterItems(config.filters || [])}
                        </div>
                        <button type="button" class="btn btn-secondary add-item" onclick="addFilterItem(this)">
                            <i class="fas fa-plus"></i> 添加分类
                        </button>
                    </div>
                </div>

                <!-- 产品列表 -->
                <div class="form-group">
                    <h4>产品列表</h4>
                    <div class="array-editor" data-field="products">
                        <label>产品项目</label>
                        <div class="array-container">
                            ${this.generateProductItems(config.products || [])}
                        </div>
                        <button type="button" class="btn btn-secondary add-item" onclick="addProductItem(this)">
                            <i class="fas fa-plus"></i> 添加产品
                        </button>
                    </div>
                </div>

                <!-- 精选产品 -->
                <div class="form-group">
                    <h4>精选产品</h4>
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
        `;
    }

    // 生成服务配置表单
    generateServicesForm(config) {
        return `
            <div class="form-section">
                <h3><i class="fas fa-tools"></i> 服务配置</h3>
                
                <!-- 页面头部 -->
                <div class="form-group">
                    <h4>页面头部</h4>
                    <label>页面标题</label>
                    <input type="text" name="page-header.title" value="${config['page-header']?.title || ''}" placeholder="服务页面标题">
                    
                    <label>页面描述</label>
                    <textarea name="page-header.description" rows="2" placeholder="页面描述">${config['page-header']?.description || ''}</textarea>
                </div>

                <!-- 服务概览 -->
                <div class="form-group">
                    <h4>服务概览</h4>
                    <label>标题</label>
                    <input type="text" name="services-overview.title" value="${config['services-overview']?.title || ''}" placeholder="服务概览标题">
                    
                    <label>描述</label>
                    <textarea name="services-overview.description" rows="3" placeholder="服务概览描述">${config['services-overview']?.description || ''}</textarea>
                    
                    <label>背景图片</label>
                    <input type="url" name="services-overview.image" value="${config['services-overview']?.image || ''}" placeholder="背景图片URL">
                </div>

                <!-- 服务项目 -->
                <div class="form-group">
                    <h4>服务项目</h4>
                    <div class="array-editor" data-field="services">
                        <label>服务列表</label>
                        <div class="array-container">
                            ${this.generateDetailedServiceItems(config.services || [])}
                        </div>
                        <button type="button" class="btn btn-secondary add-item" onclick="addDetailedServiceItem(this)">
                            <i class="fas fa-plus"></i> 添加服务
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 生成联系我们配置表单
    generateContactForm(config) {
        return `
            <div class="form-section">
                <h3><i class="fas fa-phone"></i> 联系我们配置</h3>
                
                <!-- 页面头部 -->
                <div class="form-group">
                    <h4>页面头部</h4>
                    <label>页面标题</label>
                    <input type="text" name="page-header.title" value="${config['page-header']?.title || ''}" placeholder="联系页面标题">
                    
                    <label>页面描述</label>
                    <textarea name="page-header.description" rows="2" placeholder="页面描述">${config['page-header']?.description || ''}</textarea>
                </div>

                <!-- 联系表单 -->
                <div class="form-group">
                    <h4>联系表单</h4>
                    <label>表单标题</label>
                    <input type="text" name="contact-form.title" value="${config['contact-form']?.title || ''}" placeholder="联系表单标题">
                    
                    <label>表单描述</label>
                    <textarea name="contact-form.description" rows="2" placeholder="表单描述">${config['contact-form']?.description || ''}</textarea>
                </div>

                <!-- 联系信息 -->
                <div class="form-group">
                    <h4>联系信息</h4>
                    <label>标题</label>
                    <input type="text" name="contact-info.title" value="${config['contact-info']?.title || ''}" placeholder="联系信息标题">
                    
                    <label>描述</label>
                    <textarea name="contact-info.description" rows="2" placeholder="联系信息描述">${config['contact-info']?.description || ''}</textarea>
                    
                    <h5>地图信息</h5>
                    <label>地图标题</label>
                    <input type="text" name="contact-info.map.title" value="${config['contact-info']?.map?.title || ''}" placeholder="公司名称">
                    
                    <label>纬度</label>
                    <input type="number" step="any" name="contact-info.map.latitude" value="${config['contact-info']?.map?.latitude || ''}" placeholder="21.77298725">
                    
                    <label>经度</label>
                    <input type="number" step="any" name="contact-info.map.longitude" value="${config['contact-info']?.map?.longitude || ''}" placeholder="111.91456246">
                    
                    <label>缩放级别</label>
                    <input type="number" name="contact-info.map.zoom" value="${config['contact-info']?.map?.zoom || 15}" min="1" max="20">
                    
                    <label>地址</label>
                    <textarea name="contact-info.map.address" rows="2" placeholder="公司地址">${config['contact-info']?.map?.address || ''}</textarea>
                    
                    <label>电话</label>
                    <input type="tel" name="contact-info.map.phone" value="${config['contact-info']?.map?.phone || ''}" placeholder="+86 138 0000 0000">
                    
                    <label>营业时间</label>
                    <input type="text" name="contact-info.map.hours" value="${config['contact-info']?.map?.hours || ''}" placeholder="周一至周五: 9:00-18:00">
                </div>

                <!-- 社交链接 -->
                <div class="form-group">
                    <h4>社交链接</h4>
                    <div class="array-editor" data-field="contact-info.social.links">
                        <label>社交媒体链接</label>
                        <div class="array-container">
                            ${this.generateSocialLinks(config['contact-info']?.social?.links || [])}
                        </div>
                        <button type="button" class="btn btn-secondary add-item" onclick="addSocialLink(this)">
                            <i class="fas fa-plus"></i> 添加社交链接
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 生成页脚配置表单
    generateFooterForm(config) {
        return `
            <div class="form-section">
                <h3><i class="fas fa-anchor"></i> 页脚配置</h3>
                
                <!-- 品牌信息 -->
                <div class="form-group">
                    <h4>品牌信息</h4>
                    <label>品牌名称</label>
                    <input type="text" name="brand.name" value="${config.brand?.name || ''}" placeholder="Brand">
                    
                    <label>品牌标语</label>
                    <textarea name="brand.tagline" rows="2" placeholder="品牌标语">${config.brand?.tagline || ''}</textarea>
                </div>

                <!-- 导航链接 -->
                <div class="form-group">
                    <h4>导航链接</h4>
                    <div class="array-editor" data-field="links.navigation">
                        <label>主导航</label>
                        <div class="array-container">
                            ${this.generateNavigationLinks(config.links?.navigation || [])}
                        </div>
                        <button type="button" class="btn btn-secondary add-item" onclick="addNavigationLink(this)">
                            <i class="fas fa-plus"></i> 添加导航链接
                        </button>
                    </div>
                </div>

                <!-- 服务链接 -->
                <div class="form-group">
                    <h4>服务链接</h4>
                    <div class="array-editor" data-field="links.services">
                        <label>服务列表</label>
                        <div class="array-container">
                            ${this.generateServiceLinks(config.links?.services || [])}
                        </div>
                        <button type="button" class="btn btn-secondary add-item" onclick="addServiceLink(this)">
                            <i class="fas fa-plus"></i> 添加服务链接
                        </button>
                    </div>
                </div>

                <!-- 联系信息 -->
                <div class="form-group">
                    <h4>联系信息</h4>
                    <label>邮箱</label>
                    <input type="email" name="contact.email" value="${config.contact?.email || ''}" placeholder="hello@brand.com">
                    
                    <label>电话</label>
                    <input type="tel" name="contact.phone" value="${config.contact?.phone || ''}" placeholder="+1 (234) 567-890">
                    
                    <label>地址</label>
                    <textarea name="contact.address" rows="2" placeholder="公司地址">${config.contact?.address || ''}</textarea>
                </div>

                <!-- 社交媒体 -->
                <div class="form-group">
                    <h4>社交媒体</h4>
                    <div class="array-editor" data-field="social.links">
                        <label>社交链接</label>
                        <div class="array-container">
                            ${this.generateSocialLinks(config.social?.links || [])}
                        </div>
                        <button type="button" class="btn btn-secondary add-item" onclick="addSocialLink(this)">
                            <i class="fas fa-plus"></i> 添加社交链接
                        </button>
                    </div>
                </div>

                <!-- 法律信息 -->
                <div class="form-group">
                    <h4>法律信息</h4>
                    <label>版权信息</label>
                    <input type="text" name="legal.copyright" value="${config.legal?.copyright || ''}" placeholder="All rights reserved">
                    
                    <div class="array-editor" data-field="legal.links">
                        <label>法律链接</label>
                        <div class="array-container">
                            ${this.generateLegalLinks(config.legal?.links || [])}
                        </div>
                        <button type="button" class="btn btn-secondary add-item" onclick="addLegalLink(this)">
                            <i class="fas fa-plus"></i> 添加法律链接
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 辅助方法：生成服务项目
    generateServiceItems(items) {
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
    }

    // 辅助方法：生成评价项目
    generateTestimonialItems(items) {
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
    }

    // 辅助方法：生成筛选项目
    generateFilterItems(items) {
        return items.map((item, index) => `
            <div class="array-item" data-index="${index}">
                <div class="item-controls">
                    <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="item-content">
                    <label>分类名称</label>
                    <input type="text" name="filters[${index}].label" value="${item.label || ''}" placeholder="分类名称" onchange="syncFilterValue(this)">
                    
                    <label>分类值</label>
                    <input type="text" name="filters[${index}].value" value="${item.value || ''}" placeholder="分类值（自动同步）" readonly>
                </div>
            </div>
        `).join('');
    }

    // 辅助方法：生成产品项目
    generateProductItems(items) {
        return items.map((item, index) => `
            <div class="array-item" data-index="${index}">
                <div class="item-controls">
                    <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="item-content">
                    <label>产品名称</label>
                    <input type="text" name="products[${index}].title" value="${item.title || ''}" placeholder="产品名称">
                    
                    <label>产品分类</label>
                    <input type="text" name="products[${index}].category" value="${item.category || ''}" placeholder="产品分类">
                    
                    <label>产品图片</label>
                    <input type="url" name="products[${index}].image" value="${item.image || ''}" placeholder="产品图片URL">
                    
                    <label>产品描述</label>
                    <textarea name="products[${index}].description" rows="2" placeholder="产品描述">${item.description || ''}</textarea>
                    
                    <label>产品ID (时间戳)</label>
                    <input type="text" name="products[${index}].item" value="${item.item || Date.now()}" readonly>
                </div>
            </div>
        `).join('');
    }

    // 辅助方法：生成详细服务项目
    generateDetailedServiceItems(items) {
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
    }

    // 辅助方法：生成社交链接
    generateSocialLinks(items) {
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
    }

    // 辅助方法：生成导航链接
    generateNavigationLinks(items) {
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
    }

    // 辅助方法：生成服务链接
    generateServiceLinks(items) {
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
    }

    // 辅助方法：生成法律链接
    generateLegalLinks(items) {
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
    }

    // 根据配置文件类型生成对应表单
    generateForm(configKey, config) {
        this.currentConfig = config;
        this.currentConfigKey = configKey;

        switch (configKey) {
            case 'index':
                return this.generateIndexForm(config);
            case 'products':
                return this.generateProductsForm(config);
            case 'services':
                return this.generateServicesForm(config);
            case 'contact':
                return this.generateContactForm(config);
            case 'footer':
                return this.generateFooterForm(config);
            case 'partners':
            case 'about':
                return `<div class="form-section">
                    <h3><i class="fas fa-file"></i> ${configKey} 配置</h3>
                    <p>此配置文件的可视化编辑器正在开发中，请暂时使用JSON编辑模式。</p>
                    <textarea name="raw-json" class="json-editor" rows="20">${JSON.stringify(config, null, 2)}</textarea>
                </div>`;
            default:
                return `<div class="form-section">
                    <h3><i class="fas fa-file"></i> 通用配置</h3>
                    <textarea name="raw-json" class="json-editor" rows="20">${JSON.stringify(config, null, 2)}</textarea>
                </div>`;
        }
    }

    // 从表单数据转换回JSON配置
    formDataToConfig(formData) {
        const config = {};
        
        // 处理嵌套字段（如 hero-content.title）
        for (const [key, value] of formData.entries()) {
            if (key === 'raw-json') {
                // JSON编辑模式
                try {
                    return JSON.parse(value);
                } catch (e) {
                    throw new Error('JSON格式错误: ' + e.message);
                }
            }
            
            this.setNestedValue(config, key, value);
        }
        
        // 处理数组字段的特殊格式转换
        this.processArrayFields(config);
        
        return config;
    }

    // 设置嵌套对象的值
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            
            // 处理数组索引，如 items[0]
            const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
            if (arrayMatch) {
                const arrayKey = arrayMatch[1];
                const index = parseInt(arrayMatch[2]);
                
                if (!current[arrayKey]) current[arrayKey] = [];
                if (!current[arrayKey][index]) current[arrayKey][index] = {};
                current = current[arrayKey][index];
            } else {
                if (!current[key]) current[key] = {};
                current = current[key];
            }
        }
        
        const lastKey = keys[keys.length - 1];
        
        // 处理最后一个键的数组索引
        const arrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/);
        if (arrayMatch) {
            const arrayKey = arrayMatch[1];
            const index = parseInt(arrayMatch[2]);
            
            if (!current[arrayKey]) current[arrayKey] = [];
            current[arrayKey][index] = this.convertValue(value);
        } else {
            current[lastKey] = this.convertValue(value);
        }
    }

    // 转换值的类型
    convertValue(value) {
        if (value === '') return '';
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (/^\d+$/.test(value)) return parseInt(value);
        if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
        return value;
    }

    // 处理数组字段的特殊转换
    processArrayFields(config) {
        // 转换特色字段（逗号分隔的字符串转数组）
        this.processServiceFeatures(config);
    }

    // 处理服务特色字段
    processServiceFeatures(config) {
        if (config.services && Array.isArray(config.services)) {
            config.services.forEach(service => {
                if (service.features && typeof service.features === 'string') {
                    service.features = service.features.split(',').map(f => f.trim()).filter(f => f);
                }
            });
        }
    }
}

// 创建全局实例
window.configFormEditor = new ConfigFormEditor();

// 全局辅助函数
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

window.addFilterItem = function(button) {
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
            <label>分类名称</label>
            <input type="text" name="filters[${index}].label" placeholder="分类名称" onchange="syncFilterValue(this)">
            
            <label>分类值</label>
            <input type="text" name="filters[${index}].value" placeholder="分类值（自动同步）" readonly>
        </div>
    `;
    container.appendChild(newItem);
};

window.addProductItem = function(button) {
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
            <label>产品名称</label>
            <input type="text" name="products[${index}].title" placeholder="产品名称">
            
            <label>产品分类</label>
            <input type="text" name="products[${index}].category" placeholder="产品分类">
            
            <label>产品图片</label>
            <input type="url" name="products[${index}].image" placeholder="产品图片URL">
            
            <label>产品描述</label>
            <textarea name="products[${index}].description" rows="2" placeholder="产品描述"></textarea>
            
            <label>产品ID (时间戳)</label>
            <input type="text" name="products[${index}].item" value="${Date.now()}" readonly>
        </div>
    `;
    container.appendChild(newItem);
};

window.addSocialLink = function(button) {
    const container = button.previousElementSibling;
    const index = container.children.length;
    const fieldPrefix = button.closest('.array-editor').dataset.field;
    const newItem = document.createElement('div');
    newItem.className = 'array-item';
    newItem.innerHTML = `
        <div class="item-controls">
            <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="item-content">
            <label>平台名称</label>
            <input type="text" name="${fieldPrefix}[${index}].name" placeholder="Facebook">
            
            <label>图标</label>
            <input type="text" name="${fieldPrefix}[${index}].icon" placeholder="fab fa-facebook">
            
            <label>链接</label>
            <input type="url" name="${fieldPrefix}[${index}].url" placeholder="https://facebook.com/yourpage">
        </div>
    `;
    container.appendChild(newItem);
};

window.removeArrayItem = function(button) {
    const item = button.closest('.array-item');
    item.remove();
    
    // 重新索引剩余项目
    const container = item.closest('.array-container');
    const items = container.querySelectorAll('.array-item');
    items.forEach((item, newIndex) => {
        item.dataset.index = newIndex;
        // 更新所有name属性中的索引
        const inputs = item.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.name) {
                input.name = input.name.replace(/\[\d+\]/, `[${newIndex}]`);
            }
        });
    });
};

window.syncFilterValue = function(input) {
    const value = input.value.toLowerCase().replace(/\s+/g, '-');
    const valueInput = input.closest('.item-content').querySelector('input[name$=".value"]');
    if (valueInput) {
        valueInput.value = value;
    }
};
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

    // 生成合作伙伴配置表单
    generatePartnersForm(config) {
        return `
            <div class="form-section">
                <h3><i class="fas fa-handshake"></i> 合作伙伴配置</h3>
                
                <!-- 页面头部 -->
                <div class="form-group collapsible-group">
                    <h4 class="group-header" onclick="toggleGroup(this)">
                        <i class="fas fa-chevron-down"></i> 页面头部
                    </h4>
                    <div class="group-content">
                        <label>页面标题</label>
                        <input type="text" name="page-header.title" value="${config['page-header']?.title || ''}" placeholder="合作伙伴页面标题">
                        
                        <label>页面描述</label>
                        <textarea name="page-header.description" rows="2" placeholder="页面描述">${config['page-header']?.description || ''}</textarea>
                    </div>
                </div>

                <!-- 合作伙伴列表 -->
                <div class="form-group collapsible-group">
                    <h4 class="group-header" onclick="toggleGroup(this)">
                        <i class="fas fa-chevron-down"></i> 合作伙伴列表
                    </h4>
                    <div class="group-content">
                        <div class="array-editor" data-field="partners">
                            <label>合作伙伴</label>
                            <div class="array-container">
                                ${this.generatePartnerItems(config.partners || [])}
                            </div>
                            <button type="button" class="btn btn-secondary add-item" onclick="addPartnerItem(this)">
                                <i class="fas fa-plus"></i> 添加合作伙伴
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 合作流程 -->
                <div class="form-group collapsible-group">
                    <h4 class="group-header" onclick="toggleGroup(this)">
                        <i class="fas fa-chevron-down"></i> 合作流程
                    </h4>
                    <div class="group-content">
                        <label>标题</label>
                        <input type="text" name="partnership-approach.title" value="${config['partnership-approach']?.title || ''}" placeholder="合作流程标题">
                        
                        <label>描述</label>
                        <textarea name="partnership-approach.description" rows="2" placeholder="合作流程描述">${config['partnership-approach']?.description || ''}</textarea>
                        
                        <div class="array-editor" data-field="partnership-approach.steps">
                            <label>合作步骤</label>
                            <div class="array-container">
                                ${this.generateApproachSteps(config['partnership-approach']?.steps || [])}
                            </div>
                            <button type="button" class="btn btn-secondary add-item" onclick="addApproachStep(this)">
                                <i class="fas fa-plus"></i> 添加步骤
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 合作优势 -->
                <div class="form-group collapsible-group">
                    <h4 class="group-header" onclick="toggleGroup(this)">
                        <i class="fas fa-chevron-down"></i> 合作优势
                    </h4>
                    <div class="group-content">
                        <div class="array-editor" data-field="partnership-benefits">
                            <label>合作优势</label>
                            <div class="array-container">
                                ${this.generateBenefitItems(config['partnership-benefits'] || [])}
                            </div>
                            <button type="button" class="btn btn-secondary add-item" onclick="addBenefitItem(this)">
                                <i class="fas fa-plus"></i> 添加优势
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 生成关于我们配置表单
    generateAboutForm(config) {
        return `
            <div class="form-section">
                <h3><i class="fas fa-info-circle"></i> 关于我们配置</h3>
                
                <!-- 英雄区域 -->
                <div class="form-group collapsible-group">
                    <h4 class="group-header" onclick="toggleGroup(this)">
                        <i class="fas fa-chevron-down"></i> 英雄区域
                    </h4>
                    <div class="group-content">
                        <label>标题</label>
                        <input type="text" name="hero-section.title" value="${config['hero-section']?.title || ''}" placeholder="关于我们标题">
                        
                        <label>描述</label>
                        <textarea name="hero-section.description" rows="3" placeholder="关于我们描述">${config['hero-section']?.description || ''}</textarea>
                    </div>
                </div>

                <!-- 公司故事 -->
                <div class="form-group collapsible-group">
                    <h4 class="group-header" onclick="toggleGroup(this)">
                        <i class="fas fa-chevron-down"></i> 公司故事
                    </h4>
                    <div class="group-content">
                        <label>标题</label>
                        <input type="text" name="our-story.title" value="${config['our-story']?.title || ''}" placeholder="公司故事标题">
                        
                        <label>内容</label>
                        <textarea name="our-story.content" rows="5" placeholder="公司故事内容">${config['our-story']?.content || ''}</textarea>
                        
                        <label>图片</label>
                        <input type="url" name="our-story.image" value="${config['our-story']?.image || ''}" placeholder="故事配图URL">
                        
                        <div class="array-editor" data-field="our-story.timeline">
                            <label>发展时间线</label>
                            <div class="array-container">
                                ${this.generateTimelineItems(config['our-story']?.timeline || [])}
                            </div>
                            <button type="button" class="btn btn-secondary add-item" onclick="addTimelineItem(this)">
                                <i class="fas fa-plus"></i> 添加时间节点
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 企业价值观 -->
                <div class="form-group collapsible-group">
                    <h4 class="group-header" onclick="toggleGroup(this)">
                        <i class="fas fa-chevron-down"></i> 企业价值观
                    </h4>
                    <div class="group-content">
                        <div class="array-editor" data-field="our-values">
                            <label>价值观</label>
                            <div class="array-container">
                                ${this.generateValueItems(config['our-values'] || [])}
                            </div>
                            <button type="button" class="btn btn-secondary add-item" onclick="addValueItem(this)">
                                <i class="fas fa-plus"></i> 添加价值观
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 团队成员 -->
                <div class="form-group collapsible-group">
                    <h4 class="group-header" onclick="toggleGroup(this)">
                        <i class="fas fa-chevron-down"></i> 团队成员
                    </h4>
                    <div class="group-content">
                        <div class="array-editor" data-field="our-team">
                            <label>团队成员</label>
                            <div class="array-container">
                                ${this.generateTeamItems(config['our-team'] || [])}
                            </div>
                            <button type="button" class="btn btn-secondary add-item" onclick="addTeamItem(this)">
                                <i class="fas fa-plus"></i> 添加团队成员
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 加入我们 -->
                <div class="form-group collapsible-group">
                    <h4 class="group-header" onclick="toggleGroup(this)">
                        <i class="fas fa-chevron-down"></i> 加入我们
                    </h4>
                    <div class="group-content">
                        <label>标题</label>
                        <input type="text" name="join-us.title" value="${config['join-us']?.title || ''}" placeholder="加入我们标题">
                        
                        <label>描述</label>
                        <textarea name="join-us.description" rows="3" placeholder="加入我们描述">${config['join-us']?.description || ''}</textarea>
                        
                        <label>按钮文字</label>
                        <input type="text" name="join-us.button.text" value="${config['join-us']?.button?.text || ''}" placeholder="按钮文字">
                        
                        <label>按钮链接</label>
                        <input type="text" name="join-us.button.link" value="${config['join-us']?.button?.link || ''}" placeholder="按钮链接">
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
    }

    // 辅助方法：生成产品项目
    generateProductItems(items) {
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

    // 辅助方法：生成合作伙伴项目
    generatePartnerItems(items) {
        return items.map((item, index) => `
            <div class="array-item collapsible" data-index="${index}">
                <div class="item-controls">
                    <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <span class="item-title">合作伙伴 #${index + 1}: ${item.name || '新合作伙伴'}</span>
                    <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="item-content">
                    <label>公司名称</label>
                    <input type="text" name="partners[${index}].name" value="${item.name || ''}" placeholder="合作伙伴名称" onchange="updateItemTitle(this)">
                    
                    <label>公司LOGO</label>
                    <input type="url" name="partners[${index}].logo" value="${item.logo || ''}" placeholder="LOGO URL">
                    
                    <label>合作描述</label>
                    <textarea name="partners[${index}].description" rows="2" placeholder="合作描述">${item.description || ''}</textarea>
                    
                    <label>网站链接</label>
                    <input type="url" name="partners[${index}].website" value="${item.website || ''}" placeholder="https://partner.com">
                </div>
            </div>
        `).join('');
    }

    // 辅助方法：生成合作流程步骤
    generateApproachSteps(items) {
        return items.map((item, index) => `
            <div class="array-item collapsible" data-index="${index}">
                <div class="item-controls">
                    <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <span class="item-title">步骤 #${index + 1}: ${item.title || '新步骤'}</span>
                    <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="item-content">
                    <label>步骤标题</label>
                    <input type="text" name="partnership-approach.steps[${index}].title" value="${item.title || ''}" placeholder="步骤标题" onchange="updateItemTitle(this)">
                    
                    <label>步骤描述</label>
                    <textarea name="partnership-approach.steps[${index}].description" rows="2" placeholder="步骤描述">${item.description || ''}</textarea>
                    
                    <label>步骤图标</label>
                    <input type="text" name="partnership-approach.steps[${index}].icon" value="${item.icon || ''}" placeholder="fas fa-handshake">
                </div>
            </div>
        `).join('');
    }

    // 辅助方法：生成合作优势项目
    generateBenefitItems(items) {
        return items.map((item, index) => `
            <div class="array-item collapsible" data-index="${index}">
                <div class="item-controls">
                    <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <span class="item-title">优势 #${index + 1}: ${item.title || '新优势'}</span>
                    <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="item-content">
                    <label>优势标题</label>
                    <input type="text" name="partnership-benefits[${index}].title" value="${item.title || ''}" placeholder="优势标题" onchange="updateItemTitle(this)">
                    
                    <label>优势描述</label>
                    <textarea name="partnership-benefits[${index}].description" rows="2" placeholder="优势描述">${item.description || ''}</textarea>
                    
                    <label>优势图标</label>
                    <input type="text" name="partnership-benefits[${index}].icon" value="${item.icon || ''}" placeholder="fas fa-star">
                </div>
            </div>
        `).join('');
    }

    // 辅助方法：生成时间线项目
    generateTimelineItems(items) {
        return items.map((item, index) => `
            <div class="array-item collapsible" data-index="${index}">
                <div class="item-controls">
                    <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <span class="item-title">时间节点 #${index + 1}: ${item.year || '新节点'}</span>
                    <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="item-content">
                    <label>年份</label>
                    <input type="text" name="our-story.timeline[${index}].year" value="${item.year || ''}" placeholder="2024" onchange="updateItemTitle(this)">
                    
                    <label>事件标题</label>
                    <input type="text" name="our-story.timeline[${index}].title" value="${item.title || ''}" placeholder="重要事件">
                    
                    <label>事件描述</label>
                    <textarea name="our-story.timeline[${index}].description" rows="2" placeholder="事件详情">${item.description || ''}</textarea>
                </div>
            </div>
        `).join('');
    }

    // 辅助方法：生成价值观项目
    generateValueItems(items) {
        return items.map((item, index) => `
            <div class="array-item collapsible" data-index="${index}">
                <div class="item-controls">
                    <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <span class="item-title">价值观 #${index + 1}: ${item.title || '新价值观'}</span>
                    <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="item-content">
                    <label>价值观名称</label>
                    <input type="text" name="our-values[${index}].title" value="${item.title || ''}" placeholder="价值观名称" onchange="updateItemTitle(this)">
                    
                    <label>价值观描述</label>
                    <textarea name="our-values[${index}].description" rows="2" placeholder="价值观描述">${item.description || ''}</textarea>
                    
                    <label>价值观图标</label>
                    <input type="text" name="our-values[${index}].icon" value="${item.icon || ''}" placeholder="fas fa-heart">
                </div>
            </div>
        `).join('');
    }

    // 辅助方法：生成团队成员项目
    generateTeamItems(items) {
        return items.map((item, index) => `
            <div class="array-item collapsible" data-index="${index}">
                <div class="item-controls">
                    <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <span class="item-title">团队成员 #${index + 1}: ${item.name || '新成员'}</span>
                    <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="item-content">
                    <label>姓名</label>
                    <input type="text" name="our-team[${index}].name" value="${item.name || ''}" placeholder="姓名" onchange="updateItemTitle(this)">
                    
                    <label>职位</label>
                    <input type="text" name="our-team[${index}].position" value="${item.position || ''}" placeholder="职位">
                    
                    <label>头像</label>
                    <input type="url" name="our-team[${index}].avatar" value="${item.avatar || ''}" placeholder="头像URL">
                    
                    <label>个人简介</label>
                    <textarea name="our-team[${index}].bio" rows="2" placeholder="个人简介">${item.bio || ''}</textarea>
                    
                    <label>社交链接</label>
                    <input type="url" name="our-team[${index}].social" value="${item.social || ''}" placeholder="LinkedIn或其他社交链接">
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
                return this.generatePartnersForm(config);
            case 'about':
                return this.generateAboutForm(config);
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
            
            // 跳过空值以避免覆盖隐藏字段的值
            if (value !== '') {
                this.setNestedValue(config, key, value);
            }
        }
        
        // 处理数组字段的特殊格式转换
        this.processArrayFields(config);
        
        // 确保过滤器的label和value同步
        this.syncFilterLabelsAndValues(config);
        
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

    // 同步过滤器的label和value
    syncFilterLabelsAndValues(config) {
        if (config.filters && Array.isArray(config.filters)) {
            config.filters.forEach(filter => {
                if (filter.label && !filter.value) {
                    // 如果有label但没有value，自动生成value
                    filter.value = filter.label.toLowerCase().replace(/\s+/g, '-');
                } else if (filter.label && filter.value !== filter.label.toLowerCase().replace(/\s+/g, '-')) {
                    // 确保value与label同步
                    filter.value = filter.label.toLowerCase().replace(/\s+/g, '-');
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
    // 对于新的筛选项目，同步到隐藏字段
    const hiddenInput = input.closest('.item-content').querySelector('.filter-value-hidden');
    if (hiddenInput) {
        hiddenInput.value = value;
    }
    // 向后兼容旧的筛选项目
    const valueInput = input.closest('.item-content').querySelector('input[name$=".value"]');
    if (valueInput) {
        valueInput.value = value;
    }
};

// 更新项目标题
window.updateItemTitle = function(input) {
    const titleSpan = input.closest('.array-item').querySelector('.item-title');
    if (titleSpan) {
        const itemNumber = titleSpan.textContent.split(':')[0];
        titleSpan.textContent = `${itemNumber}: ${input.value || '新项目'}`;
    }
};

// 切换数组项目的展开/收缩
window.toggleArrayItem = function(button) {
    const arrayItem = button.closest('.array-item');
    const content = arrayItem.querySelector('.item-content');
    const icon = button.querySelector('i');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.className = 'fas fa-chevron-down';
        arrayItem.classList.remove('collapsed');
    } else {
        content.style.display = 'none';
        icon.className = 'fas fa-chevron-right';
        arrayItem.classList.add('collapsed');
    }
};

// 切换分组的展开/收缩
window.toggleGroup = function(header) {
    const group = header.closest('.collapsible-group');
    const content = group.querySelector('.group-content');
    const icon = header.querySelector('i');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.className = 'fas fa-chevron-down';
        group.classList.remove('collapsed');
    } else {
        content.style.display = 'none';
        icon.className = 'fas fa-chevron-right';
        group.classList.add('collapsed');
    }
};

// Partners配置专用的辅助函数
window.addPartnerItem = function(button) {
    const container = button.previousElementSibling;
    const index = container.children.length;
    const newItem = document.createElement('div');
    newItem.className = 'array-item collapsible';
    newItem.innerHTML = `
        <div class="item-controls">
            <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                <i class="fas fa-chevron-down"></i>
            </button>
            <span class="item-title">合作伙伴 #${index + 1}: 新合作伙伴</span>
            <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="item-content">
            <label>公司名称</label>
            <input type="text" name="partners[${index}].name" placeholder="合作伙伴名称" onchange="updateItemTitle(this)">
            
            <label>公司LOGO</label>
            <input type="url" name="partners[${index}].logo" placeholder="LOGO URL">
            
            <label>合作描述</label>
            <textarea name="partners[${index}].description" rows="2" placeholder="合作描述"></textarea>
            
            <label>网站链接</label>
            <input type="url" name="partners[${index}].website" placeholder="https://partner.com">
        </div>
    `;
    container.appendChild(newItem);
};

window.addApproachStep = function(button) {
    const container = button.previousElementSibling;
    const index = container.children.length;
    const newItem = document.createElement('div');
    newItem.className = 'array-item collapsible';
    newItem.innerHTML = `
        <div class="item-controls">
            <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                <i class="fas fa-chevron-down"></i>
            </button>
            <span class="item-title">步骤 #${index + 1}: 新步骤</span>
            <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="item-content">
            <label>步骤标题</label>
            <input type="text" name="partnership-approach.steps[${index}].title" placeholder="步骤标题" onchange="updateItemTitle(this)">
            
            <label>步骤描述</label>
            <textarea name="partnership-approach.steps[${index}].description" rows="2" placeholder="步骤描述"></textarea>
            
            <label>步骤图标</label>
            <input type="text" name="partnership-approach.steps[${index}].icon" placeholder="fas fa-handshake">
        </div>
    `;
    container.appendChild(newItem);
};

window.addBenefitItem = function(button) {
    const container = button.previousElementSibling;
    const index = container.children.length;
    const newItem = document.createElement('div');
    newItem.className = 'array-item collapsible';
    newItem.innerHTML = `
        <div class="item-controls">
            <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                <i class="fas fa-chevron-down"></i>
            </button>
            <span class="item-title">优势 #${index + 1}: 新优势</span>
            <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="item-content">
            <label>优势标题</label>
            <input type="text" name="partnership-benefits[${index}].title" placeholder="优势标题" onchange="updateItemTitle(this)">
            
            <label>优势描述</label>
            <textarea name="partnership-benefits[${index}].description" rows="2" placeholder="优势描述"></textarea>
            
            <label>优势图标</label>
            <input type="text" name="partnership-benefits[${index}].icon" placeholder="fas fa-star">
        </div>
    `;
    container.appendChild(newItem);
};

// About配置专用的辅助函数
window.addTimelineItem = function(button) {
    const container = button.previousElementSibling;
    const index = container.children.length;
    const newItem = document.createElement('div');
    newItem.className = 'array-item collapsible';
    newItem.innerHTML = `
        <div class="item-controls">
            <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                <i class="fas fa-chevron-down"></i>
            </button>
            <span class="item-title">时间节点 #${index + 1}: 新节点</span>
            <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="item-content">
            <label>年份</label>
            <input type="text" name="our-story.timeline[${index}].year" placeholder="2024" onchange="updateItemTitle(this)">
            
            <label>事件标题</label>
            <input type="text" name="our-story.timeline[${index}].title" placeholder="重要事件">
            
            <label>事件描述</label>
            <textarea name="our-story.timeline[${index}].description" rows="2" placeholder="事件详情"></textarea>
        </div>
    `;
    container.appendChild(newItem);
};

window.addValueItem = function(button) {
    const container = button.previousElementSibling;
    const index = container.children.length;
    const newItem = document.createElement('div');
    newItem.className = 'array-item collapsible';
    newItem.innerHTML = `
        <div class="item-controls">
            <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                <i class="fas fa-chevron-down"></i>
            </button>
            <span class="item-title">价值观 #${index + 1}: 新价值观</span>
            <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="item-content">
            <label>价值观名称</label>
            <input type="text" name="our-values[${index}].title" placeholder="价值观名称" onchange="updateItemTitle(this)">
            
            <label>价值观描述</label>
            <textarea name="our-values[${index}].description" rows="2" placeholder="价值观描述"></textarea>
            
            <label>价值观图标</label>
            <input type="text" name="our-values[${index}].icon" placeholder="fas fa-heart">
        </div>
    `;
    container.appendChild(newItem);
};

window.addTeamItem = function(button) {
    const container = button.previousElementSibling;
    const index = container.children.length;
    const newItem = document.createElement('div');
    newItem.className = 'array-item collapsible';
    newItem.innerHTML = `
        <div class="item-controls">
            <button type="button" class="btn-collapse" onclick="toggleArrayItem(this)">
                <i class="fas fa-chevron-down"></i>
            </button>
            <span class="item-title">团队成员 #${index + 1}: 新成员</span>
            <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="item-content">
            <label>姓名</label>
            <input type="text" name="our-team[${index}].name" placeholder="姓名" onchange="updateItemTitle(this)">
            
            <label>职位</label>
            <input type="text" name="our-team[${index}].position" placeholder="职位">
            
            <label>头像</label>
            <input type="url" name="our-team[${index}].avatar" placeholder="头像URL">
            
            <label>个人简介</label>
            <textarea name="our-team[${index}].bio" rows="2" placeholder="个人简介"></textarea>
            
            <label>社交链接</label>
            <input type="url" name="our-team[${index}].social" placeholder="LinkedIn或其他社交链接">
        </div>
    `;
    container.appendChild(newItem);
};

// 其他需要的辅助函数
window.addNavigationLink = function(button) {
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
            <label>链接文本</label>
            <input type="text" name="links.navigation[${index}].text" placeholder="首页">
            
            <label>链接地址</label>
            <input type="text" name="links.navigation[${index}].url" placeholder="index.html">
        </div>
    `;
    container.appendChild(newItem);
};

window.addServiceLink = function(button) {
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
            <label>服务名称</label>
            <input type="text" name="links.services[${index}].text" placeholder="服务名称">
            
            <label>服务链接</label>
            <input type="text" name="links.services[${index}].url" placeholder="services.html">
        </div>
    `;
    container.appendChild(newItem);
};

window.addLegalLink = function(button) {
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
            <label>链接名称</label>
            <input type="text" name="legal.links[${index}].text" placeholder="隐私政策">
            
            <label>链接地址</label>
            <input type="text" name="legal.links[${index}].url" placeholder="privacy.html">
        </div>
    `;
    container.appendChild(newItem);
};

window.addDetailedServiceItem = function(button) {
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
            <label>服务名称</label>
            <input type="text" name="services[${index}].title" placeholder="服务名称">
            
            <label>服务图标</label>
            <input type="text" name="services[${index}].icon" placeholder="fas fa-cog">
            
            <label>服务描述</label>
            <textarea name="services[${index}].description" rows="2" placeholder="服务描述"></textarea>
            
            <label>服务特色 (逗号分隔)</label>
            <input type="text" name="services[${index}].features" placeholder="特色1, 特色2, 特色3">
        </div>
    `;
    container.appendChild(newItem);
};
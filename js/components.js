// 加载页面组件（header和footer）
class ComponentLoader {
    constructor() {
        this.currentPage = this.getCurrentPageName();
    }
    
    // 获取当前页面名称
    getCurrentPageName() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        return page;
    }
    
    // 异步加载HTML组件
    async loadComponent(elementId, componentPath) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
                return true;
            }
            return false;
        } catch (error) {
            console.error(`加载组件失败: ${componentPath}`, error);
            return false;
        }
    }
    
    // 设置导航栏激活状态
    setActiveNavigation() {
        // 移除所有激活状态
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => link.classList.remove('active'));
        
        // 根据当前页面设置激活状态
        const activeNavId = `nav-${this.currentPage}`;
        const activeLink = document.getElementById(activeNavId);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    // 设置当前年份
    setCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    // 加载并应用页脚配置
    async loadFooterConfig() {
        try {
            const response = await fetch('config/footer.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const footerConfig = await response.json();
            this.applyFooterConfig(footerConfig);
            return true;
        } catch (error) {
            console.error('加载页脚配置失败:', error);
            return false;
        }
    }
    
    // 应用页脚配置到页面
    applyFooterConfig(config) {
        // 更新品牌标语
        const taglineElement = document.getElementById('footer-tagline');
        if (taglineElement && config.brand) {
            taglineElement.textContent = config.brand.tagline;
        }
        
        // 更新联系信息
        if (config.contact) {
            const emailElement = document.getElementById('footer-email');
            const phoneElement = document.getElementById('footer-phone');
            const addressElement = document.getElementById('footer-address');
            
            if (emailElement) {
                emailElement.textContent = config.contact.email;
                emailElement.href = `mailto:${config.contact.email}`;
            }
            
            if (phoneElement) {
                phoneElement.textContent = config.contact.phone;
                phoneElement.href = `tel:${config.contact.phone.replace(/\s|\(|\)|\+/g, '')}`;
            }
            
            if (addressElement) {
                addressElement.innerHTML = config.contact.address;
            }
        }
        
        console.log('页脚配置应用成功');
    }
    
    // 初始化所有组件
    async initializeComponents() {
        try {
            // 并行加载header和footer
            const [headerLoaded, footerLoaded] = await Promise.all([
                this.loadComponent('header-container', 'header.html'),
                this.loadComponent('footer-container', 'footer.html')
            ]);
            
            if (headerLoaded) {
                // 设置导航栏激活状态
                this.setActiveNavigation();
            }
            
            if (footerLoaded) {
                // 设置当前年份
                this.setCurrentYear();
                
                // 加载页脚配置
                await this.loadFooterConfig();
            }
            
            console.log('组件加载完成:', { header: headerLoaded, footer: footerLoaded });
            
            // 触发自定义事件，通知组件加载完成
            document.dispatchEvent(new CustomEvent('componentsLoaded', {
                detail: { headerLoaded, footerLoaded }
            }));
            
        } catch (error) {
            console.error('组件初始化失败:', error);
        }
    }
}

// 全局组件加载器实例
window.componentLoader = new ComponentLoader();

// DOM加载完成后自动初始化组件
document.addEventListener('DOMContentLoaded', function() {
    window.componentLoader.initializeComponents();
});
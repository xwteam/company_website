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
    
    // 初始化移动端菜单
    initializeMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('nav');
        
        if (mobileMenuToggle && nav) {
            // 添加点击事件监听器
            mobileMenuToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                nav.classList.toggle('active');
                const isActive = nav.classList.contains('active');
                mobileMenuToggle.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            });
            
            // 点击导航链接后关闭移动菜单
            const navLinks = document.querySelectorAll('nav a');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    if (window.innerWidth <= 768) {
                        nav.classList.remove('active');
                        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                });
            });
            
            // 点击菜单外部区域关闭菜单
            document.addEventListener('click', function(event) {
                if (!nav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                    if (nav.classList.contains('active')) {
                        nav.classList.remove('active');
                        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                }
            });
        }
    }
    
    // 设置当前年份
    setCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    // 设置当前年份（无需JSON配置）
    updateFooterInfo() {
        // 页脚信息已直接在HTML中编写，无需动态加载
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
                
                // 初始化移动端菜单
                this.initializeMobileMenu();
            }
            
            if (footerLoaded) {
                // 设置当前年份
                this.setCurrentYear();
                
                // 更新页脚信息
                this.updateFooterInfo();
            }
            
            // 组件加载完成
            
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
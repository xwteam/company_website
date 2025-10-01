// 主题切换
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// 移动端菜单
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
}

// 滚动时改变 Header 样式
function initScrollHeader() {
    const header = document.getElementById('header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

// 平滑滚动
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 滚动指示器
function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const servicesSection = document.getElementById('services');
            if (servicesSection) {
                servicesSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}

// 渲染产品卡片
function renderProductCard(product, delay = 0) {
    return `
        <a href="product-detail.html?id=${product.id}" class="product-card" style="animation-delay: ${delay}ms">
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}">
                <div class="product-overlay"></div>
            </div>
            <div class="product-content">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-tags">
                    ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </a>
    `;
}

// 首页加载特色产品
function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (container && typeof productsData !== 'undefined') {
        const featured = productsData.slice(0, 3);
        container.innerHTML = featured.map((product, index) => 
            renderProductCard(product, index * 100)
        ).join('');
    }
}

// 产品页面功能
function initProductsPage() {
    const productsGrid = document.getElementById('productsGrid');
    const categoryFilters = document.getElementById('categoryFilters');
    
    if (!productsGrid || typeof productsData === 'undefined') return;
    
    let activeCategory = 'All';
    
    // 渲染类别过滤器
    if (categoryFilters) {
        const categories = getCategories();
        categoryFilters.innerHTML = categories.map(category => `
            <button class="filter-btn ${category === 'All' ? 'active' : ''}" data-category="${category}">
                ${category}
            </button>
        `).join('');
        
        // 添加过滤器点击事件
        categoryFilters.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                categoryFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.dataset.category;
                renderProducts(activeCategory);
            });
        });
    }
    
    // 渲染产品
    function renderProducts(category) {
        const products = filterProductsByCategory(category);
        productsGrid.innerHTML = products.map((product, index) => 
            renderProductCard(product, index * 100)
        ).join('');
    }
    
    // 初始渲染
    renderProducts(activeCategory);
}

// 产品详情页面
function initProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId || typeof productsData === 'undefined') {
        // 如果没有产品 ID，重定向到产品列表
        window.location.href = 'products.html';
        return;
    }
    
    const product = getProductById(productId);
    
    if (!product) {
        window.location.href = 'products.html';
        return;
    }
    
    // 更新页面标题
    document.title = `${product.title} - Brand`;
    
    // 填充产品信息
    const productImage = document.getElementById('productImage');
    const productCategory = document.getElementById('productCategory');
    const productTitle = document.getElementById('productTitle');
    const productTags = document.getElementById('productTags');
    const productDescription = document.getElementById('productDescription');
    
    if (productImage) {
        productImage.src = product.image;
        productImage.alt = product.title;
    }
    
    if (productCategory) {
        productCategory.textContent = product.category;
    }
    
    if (productTitle) {
        productTitle.textContent = product.title;
    }
    
    if (productTags) {
        productTags.innerHTML = product.tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
    }
    
    if (productDescription) {
        productDescription.innerHTML = product.fullDescription;
    }
}

// 表单提交处理
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 这里可以添加实际的表单提交逻辑
            // 例如使用 fetch 发送到后端 API
            
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initScrollHeader();
    initSmoothScroll();
    initScrollIndicator();
    loadFeaturedProducts();
    initProductsPage();
    initProductDetailPage();
    initContactForm();
});


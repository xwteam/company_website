# Brand Company 网站 - 纯静态版本

## 📖 项目简介

这是一个完全纯静态的企业品牌网站，所有内容都直接写在HTML文件中，无需任何配置文件或后端支持。采用规范化的目录结构，产品按类别分目录管理，便于维护和扩展。

## ✨ 特点

- ✅ **完全静态**: 无需JSON配置文件，内容直接在HTML中
- ✅ **规范化结构**: 产品按类别分目录组织
- ✅ **简单维护**: 直接编辑HTML文件即可修改内容
- ✅ **响应式设计**: 适配所有设备
- ✅ **快速部署**: 上传文件即可使用
- ✅ **SEO友好**: 静态HTML对搜索引擎友好

## 📁 文件结构

```
project/
├── index.html                    # 首页
├── about.html                    # 关于我们
├── services.html                 # 服务介绍
├── products.html                 # 产品列表页
├── partners.html                 # 合作伙伴
├── contact.html                  # 联系我们
├── header.html                   # 公共头部
├── footer.html                   # 公共尾部
├── products/                     # 产品目录
│   ├── nail/                     # 美甲工具类产品
│   │   ├── index.html           # 指甲锉产品详情
│   │   ├── buffer.html          # 指甲抛光块
│   │   └── pusher.html          # 推皮器
│   ├── web/                      # 网站开发类产品
│   │   ├── corporate-website.html  # 企业官网设计
│   │   └── ecommerce.html       # 电商平台开发
│   ├── design/                   # 品牌设计类产品
│   │   ├── brand-identity.html  # 品牌形象设计
│   │   ├── packaging.html       # 包装设计
│   │   └── ui-design.html       # UI设计
│   └── app/                      # 移动应用类产品
│       └── mobile-app.html      # 移动应用开发
├── css/                          # 样式文件
├── js/                           # JavaScript文件
├── images/                       # 图片资源
└── README.md                     # 使用说明
```

## 🚀 快速开始

### 1. 部署网站
将所有文件上传到任何静态托管平台：
- GitHub Pages
- EdgeOne Pages  
- Netlify
- Vercel
- 传统虚拟主机

### 2. 修改网站内容

#### 修改首页内容
编辑 `index.html` 文件：

```html
<!-- 修改英雄区域标题 -->
<h1>您的标题</h1>
<p>您的描述</p>

<!-- 修改服务介绍 -->
<div class="service-card">
    <h3>您的服务标题</h3>
    <p>您的服务描述</p>
</div>
```

#### 修改公司信息
编辑 `footer.html` 文件：

```html
<!-- 修改公司名称 -->
<a href="index.html">您的公司名</a>

<!-- 修改联系信息 -->
<a href="mailto:your@email.com">your@email.com</a>
<a href="tel:+1234567890">+1 (234) 567-890</a>
```

### 3. 产品管理

#### 产品目录结构
产品按类别分目录存放：
- `products/nail/` - 美甲工具类产品
- `products/web/` - 网站开发类产品  
- `products/design/` - 品牌设计类产品
- `products/app/` - 移动应用类产品

#### 添加新产品类别
1. 在 `products/` 下创建新的类别目录
2. 在产品列表页面 `products.html` 中添加筛选按钮
3. 更新导航和相关链接

#### 添加新产品页面

**步骤1：选择合适的类别目录**
```bash
# 例如添加美甲工具产品
cd products/nail/
```

**步骤2：复制现有产品页面作为模板**
```bash
cp index.html new-product.html
```

**步骤3：修改产品内容**
编辑新创建的产品页面：

```html
<!-- 修改页面标题 -->
<title>您的产品名 - Brand</title>

<!-- 修改面包屑导航 -->
<div class="breadcrumb">
    <a href="../../index.html">Home</a> > 
    <a href="../../products.html">Products</a> > 
    <a href="../index.html">产品类别</a> > 
    <span>您的产品名</span>
</div>

<!-- 修改产品信息 -->
<h1>您的产品名</h1>
<p class="product-description">产品描述</p>
```

**步骤4：更新产品列表**
在 `products.html` 中添加新产品卡片：

```html
<div class="project-card" data-category="nail">
    <div class="project-image">
        <img src="images/您的图片.jpg" alt="产品名">
    </div>
    <div class="project-content">
        <div class="project-category">美甲工具</div>
        <h3>您的产品名</h3>
        <p>产品简介</p>
        <div class="project-tags">
            <span>标签1</span>
            <span>标签2</span>
        </div>
        <a href="products/nail/new-product.html" class="btn secondary">查看详情</a>
    </div>
</div>
```

## 🎨 自定义样式

### 修改颜色主题
在 `css/style.css` 中找到并修改：

```css
:root {
    --primary-color: #您的主色;
    --secondary-color: #您的辅色;
    --text-color: #文字颜色;
}
```

### 修改字体
在HTML文件的 `<head>` 部分：

```html
<link href="https://fonts.googleapis.com/css2?family=您的字体&display=swap" rel="stylesheet">
```

## 📷 图片管理

### 推荐的图片尺寸
- **首页背景**: 1920x1080px
- **产品展示**: 800x600px
- **产品缩略图**: 400x300px
- **团队头像**: 300x300px (圆形)
- **客户Logo**: 200x100px

### 图片命名规范
- **产品主图**: `产品类别-产品名-main.jpg`
  例如：`nail-file-main.jpg`
- **产品特性图**: `产品类别-产品名-features.jpg`
- **使用示例图**: `产品类别-产品名-usage.jpg`

## 📝 内容编辑指南

### 产品页面内容结构
每个产品页面都包含以下部分：

1. **产品头部** - 基本信息和主图
2. **产品特点** - 详细特性介绍
3. **使用方法** - 操作指南（如适用）
4. **产品规格** - 技术参数
5. **材料工艺** - 制作工艺和技术
6. **用户评价** - 客户反馈
7. **相关产品** - 推荐其他产品

### 产品信息编辑

#### 基本信息
```html
<div class="product-meta">
    <div class="meta-item">
        <span class="meta-label">型号:</span>
        <span class="meta-value">产品型号</span>
    </div>
    <div class="meta-item">
        <span class="meta-label">材质:</span>
        <span class="meta-value">产品材质</span>
    </div>
</div>
```

#### 产品特点
```html
<ul>
    <li>特点一：详细描述</li>
    <li>特点二：详细描述</li>
    <li>特点三：详细描述</li>
</ul>
```

#### 相关产品链接
```html
<a href="../类别/产品页面.html" class="btn secondary">查看详情</a>
```

## 🔗 链接管理

### 相对路径规则
- **从产品页面到首页**: `../../index.html`
- **从产品页面到产品列表**: `../../products.html`
- **从产品页面到同类产品**: `../类别/产品.html`
- **从产品页面到其他类产品**: `../其他类别/产品.html`

### 图片路径
- **从产品页面引用图片**: `../../images/图片名.jpg`
- **从首页引用图片**: `images/图片名.jpg`

## 🚀 部署说明

### GitHub Pages 部署
1. 将代码推送到GitHub仓库
2. 在仓库设置中启用Pages
3. 选择主分支作为源
4. 访问 `https://用户名.github.io/仓库名`

### EdgeOne Pages 部署
1. 在EdgeOne控制台创建新项目
2. 连接Git仓库或上传文件
3. 系统自动部署
4. 绑定自定义域名（可选）

## 🔧 维护提示

### 定期更新
- 定期添加新产品页面
- 更新产品信息和图片
- 添加新的客户评价

### 产品管理
- 保持目录结构清晰
- 统一命名规范
- 及时更新相关产品链接

### 性能优化
- 压缩图片文件
- 定期检查链接有效性
- 使用浏览器缓存

## 💡 最佳实践

### 添加新产品类别
1. 创建新目录：`products/新类别/`
2. 在 `products.html` 中添加筛选按钮
3. 更新面包屑导航
4. 保持一致的页面结构

### 产品页面模板
复制现有产品页面作为模板，保持统一的：
- 页面结构
- 样式风格
- 导航逻辑
- 内容组织方式

### 图片管理
- 使用一致的图片尺寸
- 遵循命名规范
- 定期优化图片大小
- 确保所有图片都有alt属性

## 📞 技术支持

如果您在使用过程中遇到问题：

1. 检查HTML语法是否正确
2. 确认文件路径是否正确
3. 验证图片文件是否存在
4. 检查相对路径是否准确

## 📄 许可证

本项目仅供学习和参考使用。

---

✨ **现在您可以通过规范化的目录结构轻松管理产品内容！** 每个类别都有独立的目录，便于组织和维护。
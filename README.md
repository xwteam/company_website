# 纯静态 HTML 公司网站

一个完全使用 HTML、CSS 和纯 JavaScript 构建的现代化公司网站。

## 📁 文件结构

```
static/
├── index.html          # 首页
├── products.html       # 产品列表页
├── product-detail.html # 产品详情页
├── about.html          # 关于我们（待创建）
├── partners.html       # 合作伙伴（待创建）
├── contact.html        # 联系我们页
├── css/
│   └── styles.css      # 全局样式文件
├── js/
│   ├── main.js         # 主要 JavaScript 文件
│   └── products-data.js # 产品数据
└── README.md          # 说明文档
```

## 🚀 特性

- ✅ 纯静态 HTML/CSS/JavaScript，无需构建工具
- 🎨 现代化响应式设计
- 🌓 支持深色/浅色主题切换
- 📱 完美的移动端适配
- ⚡ 快速加载，无依赖
- 🎯 SEO 友好

## 📄 页面列表

- 🏠 **首页** (`index.html`) - 展示核心服务和特色产品
- 💼 **产品列表** (`products.html`) - 所有产品展示，支持分类过滤
- 📋 **产品详情** (`product-detail.html`) - 单个产品的详细信息
- 📞 **联系我们** (`contact.html`) - 联系表单和联系信息

## 🎨 样式系统

### CSS 变量
网站使用 CSS 变量实现主题系统，支持浅色和深色两种模式：

```css
:root {
    --color-background: #ffffff;
    --color-foreground: #0a0a0a;
    --color-primary: #18181b;
    /* ... 更多变量 */
}
```

### 字体
- 主字体：Inter (sans-serif)
- 标题字体：Playfair Display (serif)

## 🔧 JavaScript 功能

### 主题切换
- 自动保存用户的主题偏好到 localStorage
- 页面加载时恢复上次选择的主题

### 移动端菜单
- 响应式汉堡菜单
- 平滑的打开/关闭动画

### 产品数据管理
所有产品数据存储在 `js/products-data.js` 中，方便管理和更新：

```javascript
const productsData = [
    {
        id: 'product-id',
        title: '产品名称',
        category: '分类',
        description: '简短描述',
        image: '图片链接',
        tags: ['标签1', '标签2'],
        fullDescription: '完整描述 HTML'
    }
];
```

## 📝 如何使用

1. **直接打开**
   - 双击 `index.html` 在浏览器中打开
   - 或使用本地服务器（推荐）

2. **使用本地服务器**（推荐）
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (需要安装 http-server)
   npx http-server -p 8000
   ```
   然后访问 `http://localhost:8000`

3. **部署到服务器**
   - 直接上传所有文件到服务器
   - 支持任何静态托管服务（Netlify、Vercel、GitHub Pages 等）

## ✏️ 自定义指南

### 修改产品数据
编辑 `js/products-data.js` 文件：
- 添加新产品：在 `productsData` 数组中添加新对象
- 修改产品：直接编辑对应的产品对象
- 删除产品：从数组中移除对应对象

### 修改样式
编辑 `css/styles.css` 文件：
- 修改颜色：更改 CSS 变量
- 调整布局：修改相应的 CSS 类
- 添加新样式：在文件末尾添加新的 CSS 规则

### 修改内容
直接编辑对应的 HTML 文件：
- 首页：`index.html`
- 产品页：`products.html`
- 联系页：`contact.html`

## 🌐 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 📌 注意事项

1. 产品详情页通过 URL 参数获取产品 ID：`product-detail.html?id=product-id`
2. 主题偏好存储在浏览器的 localStorage 中
3. 表单提交功能需要后端支持，目前仅显示提示信息

## 🔄 更新日志

### v1.0.0 (2025-01-01)
- ✅ 初始版本发布
- ✅ 完成首页、产品页、联系页
- ✅ 实现主题切换功能
- ✅ 实现响应式设计

## 📄 许可证

MIT License

---

如有问题或建议，请联系：hello@brand.com


# 跨境外贸公司网站

这是一个使用 HTML、CSS 和 JavaScript 开发的跨境外贸公司网站。网站使用 EdgeOne Pages 的 KV 存储来实现动态内容管理。

## 文件结构

```
company_web/
├── index.html            # 主页
├── products.html         # 产品页面
├── services.html         # 服务页面
├── partners.html         # 合作伙伴页面
├── about.html            # 关于我们页面
├── contact.html          # 联系我们页面
├── admin.html            # 管理页面（用于管理KV存储配置）
├── css/                  # CSS样式文件
│   ├── style.css         # 主样式文件
│   ├── responsive.css    # 响应式样式
│   └── fontawesome/      # Font Awesome图标（本地化）
├── js/                   # JavaScript文件
│   ├── main.js           # 主JS文件
│   └── kv-init.js        # KV存储初始化脚本
└── images/               # 图片资源
```

## 特性

- 响应式设计，适配各种设备
- 动态内容管理（使用 EdgeOne Pages 的 KV 存储）
- 本地化的 Font Awesome 图标
- 客户评价轮播（支持滚轮控制）
- 管理界面，用于配置网站内容

## KV 存储配置

网站使用 EdgeOne Pages 的 KV 存储来管理动态内容。KV 存储的配置如下：

- 命名空间名称：`stella`
- 命名空间 ID：`ns-ctd2RL3uTaAj`

### KV 存储结构

网站使用以下键来存储内容：

- `hero-bg`：首页英雄区域背景图片 URL
- `hero-content-title`：首页英雄区域标题
- `hero-content-description`：首页英雄区域描述
- `services-description`：服务描述（JSON 格式，包含标题和服务项目列表）
- `featured-products-description`：精选产品描述
- `testimonials-description`：客户评价（JSON 格式，包含标题和评价列表）

### 管理界面

网站提供了一个管理界面（`admin.html`），用于管理 KV 存储中的配置：

1. **初始化配置**：将默认配置初始化到 KV 存储中
2. **编辑配置**：编辑 KV 存储中的各项配置
3. **导出/导入配置**：导出当前配置为 JSON 文件，或导入 JSON 配置文件

## 本地开发

对于本地开发，网站提供了一个模拟的 KV 存储 API，可以在不连接 EdgeOne Pages 的情况下进行测试。

## 部署到 EdgeOne Pages

1. 在 EdgeOne Pages 中创建一个新项目
2. 绑定 KV 存储命名空间（名称：`stella`，ID：`ns-ctd2RL3uTaAj`）
3. 部署网站代码
4. 访问管理界面（`admin.html`），初始化配置

## 注意事项

- 确保在 EdgeOne Pages 环境中正确绑定 KV 存储命名空间
- 如果配置加载失败，请检查 KV 存储是否已正确配置
- 头像图片会自动调整为 60×60 像素的固定大小，无需裁剪原图

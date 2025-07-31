# 公司网站 - EdgeOne Pages KV 存储版

这是一个使用 EdgeOne Pages KV 存储的公司网站项目。网站的内容（如英雄区域、服务、客户评价等）都存储在 KV 存储中，可以通过管理界面进行修改。

## 项目结构

```
company_web/
├── css/                  # 样式文件
│   ├── style.css         # 主样式
│   ├── responsive.css    # 响应式样式
│   └── fontawesome/      # 图标
├── js/                   # JavaScript文件
│   ├── main.js           # 主要脚本
│   └── kv-init.js        # KV存储初始化脚本
├── images/               # 图片资源
├── functions/            # EdgeOne Pages函数
│   └── api/              # API函数
│       └── kv.js         # KV存储API
├── index.html            # 首页
├── about.html            # 关于我们
├── contact.html          # 联系我们
├── products.html         # 产品页面
├── partners.html         # 合作伙伴
├── services.html         # 服务页面
└── admin.html            # 管理界面
```

## KV 存储配置

本项目使用 EdgeOne Pages 的 KV 存储来管理网站内容。KV 存储的配置如下：

- **命名空间名称**: stella
- **命名空间 ID**: ns-ctd2RL3uTaAj

### KV 存储键值结构

网站使用以下键值来存储内容：

- `config`: 完整配置（JSON）
- `hero-bg`: 英雄区域背景图片 URL（文本）
- `hero-content-title`: 英雄区域标题（文本，支持 HTML）
- `hero-content-description`: 英雄区域描述（文本）
- `services-description`: 服务描述（JSON）
- `featured-products-description`: 精选产品描述（文本）
- `testimonials-description`: 客户评价（JSON）

### JSON 结构示例

#### services-description

```json
{
  "title": "We combine strategy, design, and technology to create effective digital solutions",
  "items": [
    {
      "id": "01",
      "icon": "fas fa-globe",
      "title": "Brand Identity",
      "desc": "We create unique visual systems that embody your brand values"
    },
    {
      "id": "02",
      "icon": "fas fa-laptop-code",
      "title": "Web Development",
      "desc": "Custom website solutions built with cutting-edge technology"
    }
  ]
}
```

#### testimonials-description

```json
{
  "title": "Hear from the businesses we have helped transform",
  "items": [
    {
      "id": "01",
      "quote": "Brand helped us completely reimagine our digital presence.",
      "name": "Sarah Johnson",
      "position": "Marketing Director, TechNova",
      "avatar": "https://randomuser.me/api/portraits/women/45.jpg"
    }
  ]
}
```

## 本地开发

在本地开发环境中，网站使用模拟的 KV 存储 API，数据存储在浏览器的 localStorage 中。这允许你在没有 EdgeOne Pages 环境的情况下进行开发和测试。

### 模拟 KV 存储 API

模拟 API 在`js/kv-init.js`中实现，它提供了与 EdgeOne Pages KV 存储相同的接口：

- `stella.get(key, type)`: 获取键值
- `stella.put(key, value)`: 设置键值
- `stella.delete(key)`: 删除键值
- `stella.list()`: 列出所有键

此外，模拟 API 还会尝试通过`/api/kv/`端点访问真实的 KV 存储，如果成功则使用真实数据，否则回退到本地存储的数据。

## 部署到 EdgeOne Pages

1. 在 EdgeOne Pages 中创建一个新项目
2. 绑定 KV 命名空间：
   - 名称：stella
   - 命名空间 ID：ns-ctd2RL3uTaAj
3. 部署项目
4. 访问`/admin.html`初始化 KV 存储配置

## API 端点

网站提供以下 API 端点来访问 KV 存储：

- `GET /api/kv/`: 列出所有键
- `GET /api/kv/{key}`: 获取指定键的值
- `PUT /api/kv/{key}`: 设置指定键的值
- `DELETE /api/kv/{key}`: 删除指定键的值

## 管理界面

网站提供了一个管理界面（`admin.html`）来管理 KV 存储中的内容。你可以通过这个界面：

- 初始化默认配置
- 编辑网站内容
- 导出/导入配置

## 故障排除

### 配置加载失败

如果配置加载失败，可能是以下原因：

1. EdgeOne Pages 中未正确绑定 KV 命名空间
2. KV 存储中没有配置数据
3. 浏览器缓存问题

解决方法：

1. 确认在 EdgeOne Pages 项目中已正确绑定名为"stella"的 KV 命名空间
2. 访问`/admin.html`并点击"初始化默认配置"按钮
3. 清除浏览器缓存并强制刷新页面（Ctrl+F5 或 Cmd+Shift+R）

### 配置更新后网站没有变化

如果在管理界面更新配置后网站没有立即显示新内容，可能是以下原因：

1. EdgeOne Pages 的 KV 存储更新需要一些时间才能生效
2. 浏览器缓存问题

解决方法：

1. 等待几分钟后再次访问网站
2. 清除浏览器缓存并强制刷新页面（Ctrl+F5 或 Cmd+Shift+R）
3. 使用带有时间戳参数的 URL 访问网站，如`index.html?t=1234567890`

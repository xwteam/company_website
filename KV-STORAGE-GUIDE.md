# EdgeOne KV 存储集成指南

## 🎯 概述

本项目现已完全支持 **EdgeOne KV 存储**，可以作为 Gitee 仓库的替代方案或配合使用。您可以选择使用 Gitee 仓库、EdgeOne KV 存储，或两者结合的混合模式。

## ✨ 新增功能

### 🔄 双存储支持
- **Gitee 仓库模式**: 传统的 Git 版本控制，适合需要版本历史的场景
- **EdgeOne KV 模式**: 高性能键值存储，适合频繁读写的场景
- **数据迁移工具**: 支持 Gitee ↔ KV 双向数据迁移

### 📊 统一管理界面
- 存储类型实时切换
- 存储状态监控
- 迁移进度追踪
- 错误日志查看

## 🚀 部署配置

### 1. EdgeOne Pages 项目设置

在 EdgeOne Pages 控制台中配置以下环境变量：

#### 必需的环境变量

```bash
# 管理员认证
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password

# Gitee 配置 (可选，如果需要使用 Gitee 模式)
GITEE_USERNAME=your_gitee_username
GITEE_REPO=your_repo_name
GITEE_TOKEN=your_gitee_access_token
```

#### KV 存储绑定

在 EdgeOne Pages 项目中绑定 KV 命名空间：

1. **配置存储命名空间**
   - 命名空间名称: `CONFIG_STORAGE`
   - 变量名: `CONFIG_KV`
   - 用途: 存储网站配置文件 (config/*.json)

2. **产品存储命名空间**
   - 命名空间名称: `PRODUCTS_STORAGE`
   - 变量名: `PRODUCTS_KV`
   - 用途: 存储产品文件 (products/*.json)

### 2. KV 命名空间创建

在 EdgeOne 控制台的 "KV存储" 页面：

```bash
1. 创建命名空间: CONFIG_STORAGE
   - 用于存储网站配置文件
   - 键格式: config:{type} (如: config:index, config:products)

2. 创建命名空间: PRODUCTS_STORAGE
   - 用于存储产品数据
   - 键格式: product:{item} (如: product:1703876521000)
```

### 3. 项目绑定配置

在项目设置中绑定 KV 命名空间：

```bash
# 绑定配置存储
命名空间: CONFIG_STORAGE → 变量名: CONFIG_KV

# 绑定产品存储  
命名空间: PRODUCTS_STORAGE → 变量名: PRODUCTS_KV
```

## 📁 文件结构

### 新增的 API 端点

```
functions/api/
├── auth.js          # 认证管理 (已存在)
├── config.js        # 配置管理 (已升级支持KV)
├── products.js      # 产品管理 (已升级支持KV)
└── migration.js     # 数据迁移 (新增)
```

### KV 数据结构

#### 配置存储 (CONFIG_KV)
```json
// 键: config:index
{
  "hero": {
    "title": "Welcome to Our Website",
    "subtitle": "Professional solutions for your business"
  }
}

// 键: configs:list (索引)
[
  {
    "type": "index",
    "name": "index.json",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### 产品存储 (PRODUCTS_KV)
```json
// 键: product:1703876521000
{
  "item": "1703876521000",
  "category": "technology",
  "title": "Product Name",
  "description": "Product description"
}

// 键: products:list (索引)
[
  {
    "item": "1703876521000",
    "name": "1703876521000.json",
    "title": "Product Name",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## 🛠️ 使用指南

### 1. 管理后台操作

访问 `admin-simple.html` 进入管理后台：

#### 存储类型切换
- 在状态栏选择 "Gitee 仓库" 或 "EdgeOne KV"
- 切换时会提示保存未提交的修改
- 自动重新加载当前配置

#### 数据迁移
1. 点击 "🔄 数据迁移" 按钮
2. 查看存储状态信息
3. 选择迁移方向和数据类型：
   - **Gitee → KV**: 从仓库迁移到KV存储
   - **KV → Gitee**: 从KV存储迁移到仓库
   - **数据类型**: 全部/配置文件/产品文件

### 2. API 调用示例

#### 获取配置 (KV模式)
```javascript
const response = await fetch('/api/config', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('admin:password')
  },
  body: JSON.stringify({
    action: 'getConfig',
    configType: 'index',
    storageType: 'kv'
  })
});
```

#### 保存产品 (KV模式)
```javascript
const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('admin:password')
  },
  body: JSON.stringify({
    action: 'saveProduct',
    item: '1703876521000',
    productData: { /* 产品数据 */ },
    storageType: 'kv'
  })
});
```

#### 数据迁移
```javascript
const response = await fetch('/api/migration', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('admin:password')
  },
  body: JSON.stringify({
    action: 'migrateGiteeToKV',
    dataType: 'all'
  })
});
```

## 📊 性能对比

| 特性 | Gitee 仓库 | EdgeOne KV | 推荐场景 |
|------|------------|------------|----------|
| 读取速度 | 中等 | 极快 | 高频访问 |
| 写入速度 | 中等 | 快 | 频繁更新 |
| 版本历史 | ✅ | ❌ | 需要追溯 |
| 全球分发 | ❌ | ✅ | 多地用户 |
| 存储限制 | 仓库大小 | 100MB | 大量数据 |
| 成本 | 免费 | 低成本 | 商业项目 |

## 🔧 故障排除

### 常见问题

#### 1. KV存储无法连接
**症状**: 切换到KV模式时显示"未配置"

**解决方案**:
```bash
1. 检查 EdgeOne Pages 项目中是否正确绑定了 KV 命名空间
2. 确认变量名设置正确: CONFIG_KV, PRODUCTS_KV
3. 验证命名空间存在且有访问权限
```

#### 2. 数据迁移失败
**症状**: 迁移过程中报错或数据不完整

**解决方案**:
```bash
1. 检查源存储中的数据格式是否正确
2. 确认目标存储有写入权限
3. 查看迁移日志了解具体错误信息
4. 分批迁移：先迁移配置文件，再迁移产品文件
```

#### 3. 编码问题
**症状**: 中文字符显示乱码

**解决方案**:
```bash
1. KV存储默认使用 UTF-8 编码，通常不会有问题
2. 如果从 Gitee 迁移遇到编码问题，检查原文件编码
3. 使用管理后台的"测试中文编码"功能验证
```

### 调试工具

#### 1. 存储状态检查
访问管理后台 → 数据迁移 → 📊 存储信息

#### 2. API 调试
浏览器开发者工具 → Network 查看 API 请求响应

#### 3. KV 数据查看
EdgeOne 控制台 → KV存储 → 命名空间详情

## 🚀 最佳实践

### 1. 存储选择建议

- **纯静态网站**: 使用 Gitee 模式，利用版本控制
- **动态内容管理**: 使用 KV 模式，获得最佳性能
- **混合场景**: 配置用 Gitee，产品数据用 KV

### 2. 数据备份策略

- 定期进行双向同步，确保数据安全
- 重要操作前先备份到另一存储
- 使用迁移工具建立数据冗余

### 3. 性能优化

- 大量读取操作优选 KV 存储
- 版本管理需求使用 Gitee 模式
- 根据访问模式选择合适的存储类型

## 📞 技术支持

如果在使用过程中遇到问题：

1. 查看浏览器控制台错误信息
2. 检查 EdgeOne Pages 部署日志
3. 验证环境变量配置是否正确
4. 确认 KV 命名空间绑定状态

---

✅ **确认**: 您的项目现已完整支持 EdgeOne KV 存储，可以灵活选择最适合的存储方案！

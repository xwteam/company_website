# 🔧 EdgeOne Functions 部署状态检查指南

## 📋 问题诊断步骤

### 1️⃣ **立即使用诊断工具**

```
访问: admin/diagnostic.html
或
访问: admin/api-test.html
```

### 2️⃣ **检查 EdgeOne Pages 控制台**

登录 EdgeOne Pages 控制台，检查以下项目：

#### **Functions 部分**

- [ ] Functions 功能是否已启用
- [ ] `functions/api/config.js` 是否已部署
- [ ] 部署状态是否为"成功"
- [ ] 是否有错误日志

#### **环境变量配置**

在 EdgeOne Pages → 设置 → 环境变量中配置：

```bash
# 必需的环境变量
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
GITEE_TOKEN=48eb317592d7a716e5cdc03411e51d37

# KV存储配置
KV_NAMESPACE_ID=ns-ctd2RL3uTaAj
```

### 3️⃣ **验证文件结构**

确认您的项目包含以下文件：

```
项目根目录/
├── functions/
│   └── api/
│       ├── config.js          ✅ 主要API文件
│       └── config-handler.js  ✅ 处理器文件
├── _routes.json               ✅ 路由配置
└── admin/
    ├── admin-modular.html     ✅ 管理面板
    ├── diagnostic.html        ✅ 诊断工具
    └── api-test.html         ✅ API测试工具
```

### 4️⃣ **常见问题及解决方案**

#### ❌ **API 返回 HTML 页面**

**原因**: EdgeOne Functions 未正确部署
**解决**:

1. 重新推送代码到 Gitee
2. 在 EdgeOne Pages 中触发重新部署
3. 检查 Functions 部署日志

#### ❌ **401 Unauthorized 错误**

**原因**: 环境变量未配置或配置错误
**解决**:

1. 在 EdgeOne Pages 控制台配置环境变量
2. 确保变量名称完全匹配
3. 重新部署项目

#### ❌ **CORS 错误**

**原因**: 跨域配置问题
**解决**:

1. 确认您在正确的域名下访问
2. 不要使用 file://协议

#### ❌ **500 内部服务器错误**

**原因**: Functions 代码错误或 KV 存储问题
**解决**:

1. 检查 EdgeOne Functions 执行日志
2. 确认 KV 命名空间配置正确
3. 检查 Gitee 访问令牌有效性

### 5️⃣ **快速验证步骤**

#### **方法 1: 浏览器直接访问**

```
https://your-domain.com/api/test
```

- ✅ 期望: 返回 JSON 格式的测试数据
- ❌ 实际: 返回 HTML 页面 → Functions 未部署

#### **方法 2: 使用诊断工具**

1. 访问 `admin/api-test.html`
2. 点击"测试所有 API 端点"
3. 输入管理员凭据测试身份验证

### 6️⃣ **紧急备用方案**

如果 Functions 始终无法部署，可以：

1. **使用本地 JSON 模式**:

   ```javascript
   // 在admin/admin-modular.html中临时启用
   window.fallbackConfigManager.fallbackMode = true;
   ```

2. **手动编辑 JSON 文件**:
   - 直接编辑 `config/*.json` 文件
   - 通过 Gitee 网页界面修改
   - 推送更新触发重新部署

## 🆘 **获取技术支持**

如果按以上步骤操作后仍无法解决：

1. **收集诊断信息**:

   - 运行 `admin/diagnostic.html` 并截图
   - 收集 EdgeOne 控制台错误日志
   - 记录具体的错误消息

2. **检查 EdgeOne 服务状态**:

   - 确认 EdgeOne Pages 服务正常
   - 确认您的项目配额未超限

3. **验证网络环境**:
   - 尝试不同的网络环境
   - 检查防火墙和代理设置

---

**💡 提示**: 大部分问题都是由于环境变量未配置或 Functions 未正确部署导致的。请重点检查这两个方面。

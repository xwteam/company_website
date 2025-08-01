# 🔐 安全部署配置指南

## 📋 EdgeOne Pages 环境变量配置

为了保护敏感信息，您需要在 EdgeOne Pages 控制台中配置以下环境变量：

### 🔑 必需的环境变量

1. **GITEE_TOKEN**

   - 值：`48eb317592d7a716e5cdc03411e51d37`
   - 描述：Gitee API 访问令牌，用于自动同步配置到 Git 仓库

2. **API_SECRET**
   - 值：`your-admin-api-secret-key-here`
   - 描述：管理员 API 密钥，用于保护配置管理接口
   - **重要**：请生成一个强密码，建议 32 位随机字符串

### 📝 配置步骤

#### 1. 登录 EdgeOne 控制台

```
1. 访问 EdgeOne Pages 控制台
2. 进入您的项目设置
3. 找到"环境变量"或"Functions设置"部分
```

#### 2. 添加环境变量

```
变量名: GITEE_TOKEN
变量值: 48eb317592d7a716e5cdc03411e51d37

变量名: API_SECRET
变量值: [生成32位随机密码]
```

#### 3. 生成 API_SECRET 建议

```bash
# 使用以下方式生成强密码：
方法1: 随机字符串生成器
方法2: 使用密码管理器生成
方法3: 在线密码生成器

示例: A7xK9mP2qL8nR5vC3eW6jY1sQ4tU9bN2
```

## 🛡️ 安全特性

### 客户端安全

- ✅ API 密钥存储在 sessionStorage，关闭浏览器自动清除
- ✅ 不在 JavaScript 代码中硬编码敏感信息
- ✅ 所有敏感数据通过环境变量保护
- ✅ API 密钥验证失败自动清除本地存储

### 服务端安全

- ✅ 所有 API 接口都需要 API 密钥验证
- ✅ CORS 跨域保护
- ✅ 输入验证和错误处理
- ✅ Gitee 令牌通过环境变量保护

### 数据安全

- ✅ KV 存储全球加密同步
- ✅ Gitee 备份提供版本控制
- ✅ 配置缓存机制，减少 API 调用
- ✅ 双重保存确保数据不丢失

## 🚀 部署检查清单

### 部署前

- [ ] 确认 Gitee 令牌有效
- [ ] 生成强密码作为 API_SECRET
- [ ] 在 EdgeOne 控制台配置环境变量
- [ ] 确认命名空间绑定正确

### 部署后

- [ ] 测试 API 接口是否正常工作
- [ ] 验证 KV 存储读写功能
- [ ] 确认 Gitee 同步功能
- [ ] 测试管理界面登录功能

## 🔧 API 接口说明

### 基础 URL

```
https://your-domain.com/api/config/
```

### 接口列表

```
GET  /api/config/{key}     - 获取配置
PUT  /api/config/{key}     - 保存配置
DELETE /api/config/{key}   - 删除配置
GET  /api/config/list      - 列出所有配置
POST /api/config/sync      - 同步到Gitee
```

### 请求头

```
X-API-Key: [您的API密钥]
Content-Type: application/json
```

## 📞 故障排除

### 常见问题

1. **"API 密钥无效"错误**

   - 检查 EdgeOne 环境变量配置
   - 确认 API_SECRET 设置正确
   - 尝试重新生成 API 密钥

2. **"Gitee 同步失败"错误**

   - 检查 GITEE_TOKEN 是否有效
   - 确认 Gitee 仓库权限
   - 验证仓库名是否正确

3. **"KV 存储失败"错误**
   - 检查命名空间绑定
   - 确认 KV 存储配额
   - 验证网络连接

### 调试模式

```javascript
// 在浏览器控制台中启用调试
window.configManager.debugMode = true;
```

## ⚠️ 重要提醒

1. **永远不要**在客户端代码中硬编码敏感信息
2. **定期更换**API 密钥和访问令牌
3. **监控**API 使用情况，防止异常调用
4. **备份**重要配置数据
5. **测试**所有功能后再正式使用

---

✅ **部署完成后，您将拥有**：

- 🔒 安全的配置管理系统
- ⚡ 实时配置更新（无需重新部署）
- 📦 自动 Git 备份和版本控制
- 🌍 全球 CDN 加速的配置分发
- 👥 专业的管理员界面

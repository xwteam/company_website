# 🔐 安全凭据配置指南

## ⚠️ 重要安全提示

**新版本管理系统已移除所有客户端硬编码凭据，大幅提升安全性！**

### 🛡️ 安全改进

#### ✅ **已修复的安全问题**

- ❌ 客户端硬编码用户名密码
- ❌ 源代码中暴露凭据信息
- ❌ 不安全的降级验证机制
- ❌ 错误提示泄露凭据信息

#### 🔒 **新的安全机制**

- ✅ 仅服务器端验证（EdgeOne Functions）
- ✅ 环境变量存储凭据
- ✅ 安全的 API 端点验证
- ✅ 无硬编码降级方案

---

## 🚀 EdgeOne Pages 环境变量配置

### **1. 登录 EdgeOne 控制台**

```
https://console.cloud.tencent.com/edgeone
```

### **2. 进入您的站点管理**

- 选择您的域名站点
- 进入 "Pages" 页面管理

### **3. 配置环境变量**

在 EdgeOne Pages 项目设置中添加以下环境变量：

#### **必需的环境变量**

```bash
# 管理员用户名（请修改为您的用户名）
ADMIN_USERNAME=your_admin_username

# 管理员密码（请修改为您的强密码）
ADMIN_PASSWORD=your_secure_password

# Gitee 访问令牌（用于同步备份）
GITEE_TOKEN=your_gitee_token
```

#### **安全建议**

```bash
# 强密码示例（请不要直接使用）
ADMIN_USERNAME=site_admin_2024
ADMIN_PASSWORD=SecurePass@2024!EdgeOne

# 密码要求
- 至少12位字符
- 包含大小写字母、数字、特殊字符
- 避免使用常见词汇
- 定期更换密码
```

### **4. 重新部署**

配置环境变量后，需要重新部署才能生效：

- 在 EdgeOne Pages 中触发重新部署
- 或者推送新的代码提交

---

## 🔧 验证配置

### **方法 1：使用 API 诊断工具**

```
访问：https://your-domain.com/api-test.html
```

### **方法 2：使用登录测试页面**

```
访问：https://your-domain.com/login-test.html
```

### **方法 3：直接访问管理中心**

```
访问：https://your-domain.com/admin_manager.html
```

---

## 🎯 新的访问流程

### **1. 访问管理中心**

```
https://your-domain.com/admin_manager.html
```

### **2. 使用您配置的凭据登录**

- 用户名：您在环境变量中设置的 `ADMIN_USERNAME`
- 密码：您在环境变量中设置的 `ADMIN_PASSWORD`

### **3. 安全提示**

- ✅ 系统会显示"连接正常，所有功能可用"
- ⚠️ 如果 API 不可用，系统会拒绝登录（不再降级）
- 🔒 所有验证都在服务器端进行

---

## 🔄 访问地址更新

### **新的管理页面**

```bash
# 主要管理中心（推荐）
admin_manager.html          # 🔒 安全的管理中心

# 备用工具
admin-fallback.html         # 🛠️ 降级版编辑器
api-test.html              # 🔍 API诊断工具
login-test.html            # 🧪 登录测试页面
demo-visual-editor.html    # 📖 功能演示页面
```

### **已停用的页面**

```bash
admin-visual.html          # ❌ 已停用（存在安全隐患）
```

---

## 🛡️ 安全最佳实践

### **环境变量安全**

1. **定期更换密码**：建议每 3 个月更换一次
2. **强密码策略**：至少 12 位，包含多种字符类型
3. **访问记录**：定期检查登录日志
4. **权限控制**：只给必要人员提供凭据

### **网络安全**

1. **HTTPS 访问**：确保使用 HTTPS 访问管理页面
2. **安全网络**：避免在公共 WiFi 下登录
3. **及时退出**：使用完毕后及时退出登录
4. **浏览器安全**：使用最新版本浏览器

### **代码安全**

1. **环境隔离**：生产和测试环境使用不同凭据
2. **版本控制**：确保凭据不会提交到 Git 仓库
3. **访问控制**：限制管理页面的网络访问
4. **监控预警**：设置异常登录预警

---

## 🚨 紧急情况处理

### **如果忘记凭据**

1. 登录 EdgeOne 控制台
2. 查看或重置环境变量
3. 重新部署站点

### **如果怀疑凭据泄露**

1. 立即更改环境变量中的密码
2. 重新部署站点
3. 检查访问日志
4. 通知相关人员

### **如果管理页面无法访问**

1. 检查 EdgeOne Functions 部署状态
2. 使用 `api-test.html` 诊断 API
3. 查看 EdgeOne 控制台错误日志
4. 使用 `admin-fallback.html` 作为备用

---

## 📞 技术支持

如果在配置过程中遇到问题：

1. **查看诊断工具**：`login-test.html`
2. **检查控制台错误**：浏览器开发者工具
3. **验证 API 状态**：`api-test.html`
4. **查看部署日志**：EdgeOne Pages 控制台

---

## ✅ 配置检查清单

- [ ] 已在 EdgeOne Pages 中配置 `ADMIN_USERNAME` 环境变量
- [ ] 已在 EdgeOne Pages 中配置 `ADMIN_PASSWORD` 环境变量
- [ ] 已在 EdgeOne Pages 中配置 `GITEE_TOKEN` 环境变量
- [ ] 已重新部署站点使环境变量生效
- [ ] 已测试新凭据可以正常登录 `admin_manager.html`
- [ ] 已更新书签和链接到新的管理页面地址
- [ ] 已通知团队成员新的访问方式和凭据

---

**🎉 配置完成后，您的网站管理系统将拥有企业级的安全保护！**

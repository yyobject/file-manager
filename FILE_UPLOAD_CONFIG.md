# 文件上传大小配置说明

## ✅ 已修复配置

文件上传大小限制已从 **10MB** 提升到 **100MB**。

---

## 🔧 修改的配置

### 1. Next.js 配置 (next.config.js)

```javascript
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Server Actions 最大 100MB
    },
  },
}
```

### 2. 环境变量 (.env.local)

```env
# 最大文件上传大小（100MB = 104857600 字节）
MAX_FILE_SIZE=104857600
```

### 3. API 路由配置 (app/api/files/upload/route.ts)

```typescript
export const runtime = 'nodejs';
export const maxDuration = 60; // 最大执行时间 60 秒
```

### 4. 前端文件大小检查 (components/FileManager.tsx)

```typescript
const maxSize = 100 * 1024 * 1024; // 100MB
if (file.size > maxSize) {
  // 拒绝上传
}
```

---

## 📊 当前限制

| 配置项 | 当前值 | 说明 |
|--------|--------|------|
| 单个文件最大 | 100MB | 可上传的单个文件大小 |
| 执行超时 | 60秒 | 上传请求的最大处理时间 |
| 多文件上传 | 无限制 | 可同时上传多个文件 |

---

## 🎯 如何修改限制

### 想要更大的文件（如 500MB）

#### 1. 修改 next.config.js
```javascript
experimental: {
  serverActions: {
    bodySizeLimit: '500mb', // 改为 500MB
  },
}
```

#### 2. 修改 .env.local
```env
MAX_FILE_SIZE=524288000  # 500MB = 500 * 1024 * 1024
```

#### 3. 修改前端检查 (components/FileManager.tsx)
```typescript
const maxSize = 500 * 1024 * 1024; // 改为 500MB
```

#### 4. 增加超时时间 (app/api/files/upload/route.ts)
```typescript
export const maxDuration = 120; // 改为 120 秒
```

---

## ⚠️ 注意事项

### 1. 服务器内存
上传大文件会消耗较多内存，确保服务器有足够资源。

**建议配置**：
- 100MB 文件 → 至少 512MB 内存
- 500MB 文件 → 至少 2GB 内存
- 1GB 文件 → 至少 4GB 内存

### 2. 超时时间
根据网络速度和文件大小调整 `maxDuration`：

**参考**：
- 100MB @ 10Mbps → 约 80 秒
- 500MB @ 10Mbps → 约 400 秒（需要调整）
- 100MB @ 100Mbps → 约 8 秒

### 3. Vercel 部署限制
如果部署到 Vercel：
- **Hobby 计划**: 最大 4.5MB 请求体
- **Pro 计划**: 最大 4.5MB 请求体
- **Enterprise 计划**: 可自定义

**建议**: 生产环境使用云存储（S3/OSS）处理大文件上传。

---

## 🚀 重启服务器

修改配置后，需要重启开发服务器：

```bash
# 按 Ctrl+C 停止服务器
# 然后重新启动
npm run dev
```

---

## 📝 测试上传

### 测试命令行创建大文件

```bash
# 创建 50MB 测试文件
dd if=/dev/zero of=test-50mb.bin bs=1m count=50

# 创建 100MB 测试文件
dd if=/dev/zero of=test-100mb.bin bs=1m count=100
```

### 预期结果

✅ **成功**: 文件小于 100MB
```json
{
  "success": true,
  "filename": "test-50mb.bin",
  "path": "test-50mb.bin",
  "size": 52428800
}
```

❌ **失败**: 文件大于 100MB
```json
{
  "error": "File size exceeds 100MB limit"
}
```

---

## 🔍 故障排查

### 问题 1: 仍然提示 10MB 限制

**原因**: 配置未生效

**解决**:
1. 确认 next.config.js 已保存
2. 重启开发服务器 (Ctrl+C 然后 npm run dev)
3. 清除浏览器缓存

### 问题 2: 上传卡住或超时

**原因**: 文件太大或网络慢

**解决**:
1. 增加 `maxDuration` 值
2. 检查网络连接
3. 使用更小的测试文件

### 问题 3: 内存不足错误

**原因**: 服务器内存不够

**解决**:
1. 减小 `bodySizeLimit` 值
2. 增加服务器内存
3. 考虑使用流式上传（分片上传）

---

## 💡 生产环境建议

### 1. 使用云存储
```typescript
// 推荐: AWS S3, 阿里云 OSS, 七牛云
// 支持断点续传、分片上传
```

### 2. 分片上传
对于超大文件（>100MB），使用分片上传：
- 将文件分成多个小块
- 逐块上传
- 服务器端合并

### 3. 进度显示
添加上传进度条，提升用户体验。

---

## 📚 相关文档

- [Next.js Server Actions 配置](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions)
- [Next.js Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)

---

**当前配置已支持 100MB 文件上传！** 🎉

如需更大限制，按照上述步骤修改配置即可。

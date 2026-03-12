# 系统架构文档

## 📐 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌──────────────────┐          ┌──────────────────────┐    │
│  │  Chat Page       │          │  File Manager Panel  │    │
│  │  (page.tsx)      │◄────────►│  (Drawer)           │    │
│  └──────────────────┘          └──────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Middleware (middleware.ts)                │    │
│  │  - JWT Token 验证                                    │    │
│  │  - 权限检查                                           │    │
│  │  - 用户信息注入                                        │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│  ┌───────────────────────┴────────────────────────────┐    │
│  │                  API Routes                          │    │
│  │                                                       │    │
│  │  ┌──────────────────┐      ┌──────────────────┐    │    │
│  │  │  /api/auth/*     │      │  /api/files/*    │    │    │
│  │  │  - login         │      │  - route (list)  │    │    │
│  │  │  - register      │      │  - read          │    │    │
│  │  │  - logout        │      │  - save          │    │    │
│  │  └──────────────────┘      │  - upload        │    │    │
│  │                             │  - delete        │    │    │
│  │                             │  - mkdir         │    │    │
│  │                             └──────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│  ┌───────────────────────┴────────────────────────────┐    │
│  │              Business Logic (lib/)                   │    │
│  │  - auth.ts: JWT 生成/验证、密码哈希                   │    │
│  │  - files.ts: 文件操作、路径安全检查                   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   File System                               │
│                                                              │
│  user-files/                                                │
│  ├── user1/                                                 │
│  │   ├── document.txt                                       │
│  │   ├── images/                                            │
│  │   │   └── photo.jpg                                      │
│  │   └── videos/                                            │
│  │       └── demo.mp4                                       │
│  └── user2/                                                 │
│      └── ...                                                │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 认证流程

```
用户登录
   │
   ├─► 1. POST /api/auth/login
   │       - 验证用户名/密码
   │       - bcrypt.compare(password, hashedPassword)
   │
   ├─► 2. 生成 JWT Token
   │       - jwt.sign({ userId, username, email }, SECRET, { expiresIn: '7d' })
   │
   ├─► 3. 设置 HTTP-only Cookie
   │       - response.cookies.set('token', token, { httpOnly: true })
   │
   └─► 4. 返回用户信息
           - { user: {...}, token: '...' }

后续请求
   │
   ├─► 1. Middleware 拦截
   │       - 从 Cookie 读取 token
   │       - 验证 token 有效性
   │
   ├─► 2. 提取用户信息
   │       - jwt.verify(token, SECRET)
   │       - { userId, username, email }
   │
   ├─► 3. 注入请求头
   │       - headers.set('x-user-id', userId)
   │       - headers.set('x-username', username)
   │
   └─► 4. 继续处理请求
           - API Routes 从 headers 获取用户信息
```

## 📁 文件操作流程

### 上传文件

```
用户选择文件
   │
   ├─► 1. FormData 封装
   │       - formData.append('file', file)
   │       - formData.append('path', '')
   │
   ├─► 2. POST /api/files/upload
   │       - Middleware 验证 token
   │       - 提取 userId from headers
   │
   ├─► 3. 保存文件
   │       - 目标路径: user-files/{userId}/{filename}
   │       - 确保目录存在
   │       - fs.writeFile(fullPath, buffer)
   │
   └─► 4. 返回结果
           - { success: true, filename, path }
```

### 读取文件

```
用户点击文件
   │
   ├─► 1. GET /api/files/read?path=...
   │       - Middleware 验证 token
   │       - 提取 userId from headers
   │
   ├─► 2. 安全检查
   │       - isPathSafe(userId, filePath)
   │       - 防止路径遍历攻击
   │
   ├─► 3. 读取文件
   │       - fullPath = user-files/{userId}/{filePath}
   │       - content = fs.readFile(fullPath)
   │
   └─► 4. 返回内容
           - 文本文件: { content: string, mimeType }
           - 二进制文件: Response with Content-Type header
```

### 保存文件

```
用户编辑文件 + Cmd+S
   │
   ├─► 1. POST /api/files/save
   │       - { path: '...', content: '...' }
   │       - Middleware 验证 token
   │
   ├─► 2. 安全检查
   │       - isPathSafe(userId, filePath)
   │
   ├─► 3. 更新文件
   │       - fs.writeFile(fullPath, content)
   │
   └─► 4. 返回成功
           - { success: true }
```

## 🛡️ 安全机制

### 1. 认证安全

```typescript
// 密码哈希（不存储明文）
const hashedPassword = await bcrypt.hash(password, 10);

// JWT Token（7天过期）
const token = jwt.sign(payload, SECRET, { expiresIn: '7d' });

// HTTP-only Cookie（防止 XSS）
response.cookies.set('token', token, {
  httpOnly: true,        // JS 无法访问
  secure: true,          // HTTPS only (生产环境)
  sameSite: 'strict',    // 防止 CSRF
  maxAge: 60 * 60 * 24 * 7
});
```

### 2. 路径安全

```typescript
// 防止路径遍历攻击
export function isPathSafe(userId: string, filePath: string): boolean {
  const userPath = getUserFilesPath(userId);  // /user-files/user1
  const fullPath = path.join(userPath, filePath);
  const normalizedPath = path.normalize(fullPath);

  // 确保最终路径仍在用户目录内
  return normalizedPath.startsWith(userPath);
}

// 攻击示例（会被阻止）:
// filePath = "../../../etc/passwd"  ✗ 被拒绝
// filePath = "my-files/doc.txt"     ✓ 允许
```

### 3. 用户隔离

```typescript
// 每个用户独立目录
const getUserFilesPath = (userId: string) => {
  return path.join(process.cwd(), 'user-files', userId);
};

// user1 只能访问 /user-files/user1/
// user2 只能访问 /user-files/user2/
// 完全隔离，互不可见
```

## 🔄 数据流

### 前端 → 后端

```typescript
// 1. 前端发起请求
const response = await fetch('/api/files', {
  method: 'GET',
  // Cookie 自动携带 token
});

// 2. Middleware 处理
// - 验证 Cookie 中的 token
// - 注入 x-user-id 到 headers

// 3. API Route 处理
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');  // 从 Middleware 注入
  const files = await getFileTree(userId);
  return NextResponse.json({ files });
}

// 4. 业务逻辑
export async function getFileTree(userId: string) {
  const userPath = getUserFilesPath(userId);  // user-files/user1
  // ... 读取文件系统
  return files;
}
```

## 📦 组件架构

```
app/
├── page.tsx                    # 主页面（容器）
│   ├── <ChatArea />           # 聊天区域
│   └── <FileManager />        # 文件管理抽屉
│
components/
├── ChatArea.tsx               # 聊天组件
│   - 消息列表
│   - 输入框
│   - "管理文件" 按钮
│
├── FileManager.tsx            # 文件管理主组件
│   ├── <FileTree />          # 文件树
│   └── <FileViewer />        # 文件查看器
│
├── FileTree.tsx               # 文件树组件
│   - 递归渲染文件/文件夹
│   - 展开/折叠
│   - 选中状态
│   - 删除按钮
│
└── FileViewer.tsx             # 文件查看/编辑器
    ├── <MonacoEditor />      # 文本编辑器（动态导入）
    ├── <img />               # 图片预览
    └── <video />             # 视频播放
```

## 🗂️ 文件系统结构

```
file-manager/
├── app/                       # Next.js App Router
│   ├── api/                  # API 路由
│   ├── login/                # 登录页面
│   ├── page.tsx              # 主页
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
│
├── components/                # React 组件
├── lib/                       # 工具函数
│   ├── auth.ts               # 认证逻辑
│   └── files.ts              # 文件操作
│
├── middleware.ts              # Next.js 中间件
├── user-files/                # 用户文件存储（运行时创建）
│   ├── user1/
│   └── user2/
│
├── .env.local                 # 环境变量
├── package.json
└── tsconfig.json
```

## 🔧 技术选型理由

### 为什么选择 Next.js？
- ✅ 全栈框架，无需单独后端
- ✅ App Router 支持 Server Actions
- ✅ API Routes 内置
- ✅ Middleware 统一权限控制
- ✅ TypeScript 一等公民

### 为什么选择 JWT？
- ✅ 无状态认证
- ✅ 跨域友好
- ✅ 易于扩展
- ✅ 标准化 (RFC 7519)

### 为什么选择文件系统存储？
- ✅ 简单直接
- ✅ 无需数据库
- ✅ 易于备份
- ✅ 适合演示/原型

### 为什么选择 Monaco Editor？
- ✅ VS Code 同款
- ✅ 功能强大
- ✅ 语法高亮丰富
- ✅ 自动补全

## 🚀 性能优化

### 1. 动态导入

```typescript
// Monaco Editor 体积大，动态导入
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,  // 仅客户端加载
  loading: () => <div>加载编辑器...</div>,
});
```

### 2. 文件上传限制

```typescript
// next.config.js
experimental: {
  serverActions: {
    bodySizeLimit: '50mb',  // 限制文件大小
  },
}
```

### 3. 懒加载

```typescript
// 文件内容只在点击时加载
useEffect(() => {
  if (file) {
    fetch(`/api/files/read?path=${file.path}`)
      .then(...)
  }
}, [file]);
```

## 📈 可扩展性

### 数据库集成

当前使用内存存储用户信息，可替换为：

```typescript
// lib/auth.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function loginUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  // ...
}
```

### 云存储集成

当前使用本地文件系统，可替换为 S3：

```typescript
// lib/files.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });

export async function uploadFile(userId: string, file: File) {
  await s3.send(new PutObjectCommand({
    Bucket: 'my-bucket',
    Key: `${userId}/${file.name}`,
    Body: file,
  }));
}
```

### WebSocket 实时同步

添加实时文件更新通知：

```typescript
// lib/websocket.ts
import { Server } from 'socket.io';

export function notifyFileChange(userId: string, file: FileNode) {
  io.to(`user-${userId}`).emit('file-changed', file);
}
```

## 📚 参考资料

- [Next.js 文档](https://nextjs.org/docs)
- [JWT 规范](https://tools.ietf.org/html/rfc7519)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Node.js fs 模块](https://nodejs.org/api/fs.html)

# 文件管理系统 (File Manager)

一个基于 Next.js 的全栈文件管理系统，支持用户认证、文件上传下载、在线编辑、图片视频预览。

## ✨ 核心功能

### 🔐 用户认证
- ✅ JWT Token 认证
- ✅ 用户注册/登录
- ✅ HTTP-only Cookie 安全存储
- ✅ Middleware 权限验证

### 📁 文件管理
- ✅ **独立用户目录** - 每个用户拥有独立的文件存储空间
- ✅ **文件树导航** - 可折叠的文件夹结构
- ✅ **文件上传** - 支持多文件上传
- ✅ **创建文件夹** - 组织你的文件
- ✅ **删除文件/文件夹** - 完整的文件管理

### 📝 文件编辑与预览
- ✅ **文本编辑** - Monaco Editor（VS Code 同款）
- ✅ **图片预览** - PNG, JPG, GIF, SVG, WebP
- ✅ **视频预览** - MP4, WebM, OGG
- ✅ **语法高亮** - 支持 20+ 种编程语言
- ✅ **自动保存提示** - 未保存标记 + Cmd+S 快捷键

### 🎨 UI/UX
- ✅ **侧边抽屉** - 从聊天页面滑出的文件管理面板
- ✅ **响应式布局** - 适配不同屏幕尺寸
- ✅ **暗色主题** - 专业的深色界面
- ✅ **实时状态** - 加载、保存状态实时反馈

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **编辑器**: Monaco Editor
- **UI**: React 19

### 后端
- **框架**: Next.js API Routes
- **认证**: JWT + bcrypt
- **文件操作**: Node.js fs
- **中间件**: Next.js Middleware

### 安全
- ✅ 路径遍历防护
- ✅ HTTP-only Cookies
- ✅ 密码哈希（bcrypt）
- ✅ Token 过期验证

## 📦 安装

```bash
# 克隆项目（如果从 git）
git clone <repository-url>
cd file-manager

# 确保使用 Node.js 20+
nvm use 20

# 安装依赖
npm install
```

## ⚙️ 配置

编辑 `.env.local` 文件：

```env
# JWT 密钥（生产环境请使用强密码）
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 用户文件根目录
USER_FILES_ROOT=./user-files

# 最大文件上传大小（字节，默认 50MB）
MAX_FILE_SIZE=52428800
```

## 🚀 运行

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 运行生产版本
npm start
```

访问 http://localhost:3000

## 👤 测试账号

系统预置了两个测试账号：

| 用户名 | 密码 | 说明 |
|--------|------|------|
| demo | demo123 | 普通用户 |
| admin | admin123 | 管理员 |

也可以注册新用户。

## 📖 使用指南

### 1. 登录系统
- 访问 http://localhost:3000
- 自动跳转到登录页面
- 使用测试账号或注册新账号

### 2. 管理文件
- 点击右上角**"管理文件"**按钮
- 右侧滑出文件管理面板

### 3. 上传文件
- 点击**"上传文件"**按钮
- 选择一个或多个文件
- 自动上传到你的目录

### 4. 创建文件夹
- 点击**"新建文件夹"**按钮
- 输入文件夹名称
- 在文件树中展开查看

### 5. 编辑文件
- 点击文本文件（.txt, .js, .md 等）
- 在 Monaco Editor 中编辑
- 按 `Cmd+S` (Mac) 或 `Ctrl+S` (Windows) 保存

### 6. 预览文件
- **图片**: 点击图片文件直接预览
- **视频**: 点击视频文件播放

### 7. 删除文件
- 鼠标悬停在文件上
- 点击删除图标
- 确认删除

## 🏗️ 项目结构

```
file-manager/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── auth/                 # 认证 API
│   │   │   ├── login/route.ts    # 登录
│   │   │   ├── register/route.ts # 注册
│   │   │   └── logout/route.ts   # 登出
│   │   └── files/                # 文件管理 API
│   │       ├── route.ts          # 获取文件列表
│   │       ├── read/route.ts     # 读取文件
│   │       ├── save/route.ts     # 保存文件
│   │       ├── upload/route.ts   # 上传文件
│   │       ├── delete/route.ts   # 删除文件
│   │       └── mkdir/route.ts    # 创建文件夹
│   ├── login/                    # 登录页面
│   ├── page.tsx                  # 主页（聊天 + 文件管理）
│   └── layout.tsx                # 根布局
├── components/                   # React 组件
│   ├── ChatArea.tsx              # 聊天区域
│   ├── FileManager.tsx           # 文件管理主组件
│   ├── FileTree.tsx              # 文件树组件
│   └── FileViewer.tsx            # 文件查看/编辑器
├── lib/                          # 工具函数
│   ├── auth.ts                   # 认证逻辑
│   └── files.ts                  # 文件操作
├── middleware.ts                 # Next.js 中间件（权限验证）
├── user-files/                   # 用户文件存储目录（自动创建）
│   ├── user1/                    # 用户1的文件
│   ├── user2/                    # 用户2的文件
│   └── ...
└── .env.local                    # 环境变量
```

## 🔒 安全特性

### 1. 认证安全
- JWT Token 7天过期
- HTTP-only Cookies 防止 XSS 攻击
- bcrypt 密码哈希（10 rounds）

### 2. 文件安全
- 路径遍历防护（`isPathSafe` 函数）
- 用户文件完全隔离
- 文件大小限制（50MB）

### 3. API 安全
- Middleware 统一权限验证
- 请求头注入用户信息
- 错误处理和日志记录

## 🎯 支持的文件类型

### 文本文件（可编辑）
- JavaScript/TypeScript: `.js`, `.ts`, `.jsx`, `.tsx`
- Web: `.html`, `.css`, `.json`
- 标记语言: `.md`, `.xml`, `.yaml`
- 编程语言: `.py`, `.java`, `.cpp`, `.c`, `.go`, `.rs`, `.php`, `.rb`
- 其他: `.txt`, `.sh`, `.env`

### 图片文件（预览）
`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.bmp`, `.ico`

### 视频文件（播放）
`.mp4`, `.webm`, `.ogg`, `.mov`

## 🔧 开发说明

### 添加新的文件类型支持

编辑 `lib/files.ts`：

```typescript
export function isTextFile(filename: string): boolean {
  const textExtensions = [
    // 添加新的扩展名
    '.vue', '.scss', '.less'
  ];
  // ...
}
```

### 修改用户存储路径

编辑 `.env.local`：

```env
USER_FILES_ROOT=/path/to/your/storage
```

### 自定义编辑器主题

编辑 `components/FileViewer.tsx`：

```typescript
<MonacoEditor
  theme="vs-dark"  // 可选: vs-dark, vs-light, hc-black
  // ...
/>
```

## 📝 待实现功能

- [ ] 文件搜索
- [ ] 文件重命名
- [ ] 文件移动
- [ ] 批量操作
- [ ] 文件分享链接
- [ ] 文件历史版本
- [ ] 回收站功能
- [ ] 文件压缩下载
- [ ] 文件夹上传
- [ ] 拖拽上传
- [ ] 图片编辑
- [ ] PDF 预览
- [ ] 音频播放

## 🐛 已知问题

1. 大文件上传可能超时（建议使用分片上传）
2. 视频预览依赖浏览器支持的格式
3. SVG 文件在某些情况下可能需要手动处理

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请提交 Issue 或联系开发者。

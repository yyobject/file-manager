# 集成到现有 Next.js 项目指南

## 🎯 需求

从现有项目的按钮点击，打开文件管理抽屉（不要左侧聊天部分）

---

## 📦 方案 1: 独立路由（推荐）

将文件管理作为独立页面，通过 iframe 或新窗口打开。

### 1. 创建纯文件管理页面

```tsx
// 本项目：app/files-only/page.tsx
'use client';

import { useState } from 'react';
import FileManager from '@/components/FileManager';

export default function FilesOnlyPage() {
  return (
    <div className="h-screen bg-gray-900">
      <FileManager
        isOpen={true}
        onClose={() => window.close()}
      />
    </div>
  );
}
```

### 2. 在你的项目中打开

```tsx
// 你的现有项目
function YourComponent() {
  const handleOpenFiles = () => {
    // 方式1: 新窗口
    window.open('http://localhost:3003/files-only', '_blank', 'width=1200,height=800');

    // 方式2: iframe
    setShowFileManager(true);
  };

  return (
    <>
      <button onClick={handleOpenFiles}>管理文件</button>

      {showFileManager && (
        <div className="fixed inset-0 z-50">
          <iframe
            src="http://localhost:3003/files-only"
            className="w-full h-full border-0"
          />
        </div>
      )}
    </>
  );
}
```

**优点：**
- ✅ 完全独立，不影响现有项目
- ✅ 认证隔离，更安全
- ✅ 可以独立部署和更新

**缺点：**
- ⚠️ 需要处理跨域认证
- ⚠️ iframe 体验略差

---

## 📦 方案 2: 复制组件（完全集成）

将文件管理组件复制到你的项目中。

### 步骤 1: 复制必要文件

从这个项目复制到你的项目：

```bash
# 复制组件
cp -r file-manager/components/FileManager.tsx your-project/components/
cp -r file-manager/components/FileTree.tsx your-project/components/
cp -r file-manager/components/FileViewer.tsx your-project/components/

# 复制 lib
cp -r file-manager/lib/files.ts your-project/lib/
cp -r file-manager/lib/auth.ts your-project/lib/

# 复制 API 路由
cp -r file-manager/app/api/files your-project/app/api/

# 复制 Middleware（如果需要）
cp file-manager/middleware.ts your-project/
```

### 步骤 2: 安装依赖

```bash
cd your-project
npm install @monaco-editor/react jose bcryptjs
npm install -D @types/bcryptjs
```

### 步骤 3: 在你的页面使用

```tsx
// your-project/app/your-page/page.tsx
'use client';

import { useState } from 'react';
import FileManager from '@/components/FileManager';

export default function YourPage() {
  const [showFileManager, setShowFileManager] = useState(false);

  return (
    <div className="flex h-screen">
      {/* 你的现有内容 */}
      <div className="flex-1">
        <h1>你的应用</h1>
        <button onClick={() => setShowFileManager(true)}>
          管理文件
        </button>
      </div>

      {/* 文件管理抽屉 */}
      <FileManager
        isOpen={showFileManager}
        onClose={() => setShowFileManager(false)}
      />
    </div>
  );
}
```

**优点：**
- ✅ 完全集成，体验最好
- ✅ 共享认证状态
- ✅ 无跨域问题

**缺点：**
- ⚠️ 需要复制大量代码
- ⚠️ 需要合并依赖
- ⚠️ 更新不方便

---

## 📦 方案 3: NPM 包（最佳实践）

将文件管理封装为 NPM 包。

### 步骤 1: 创建 NPM 包

```bash
# 在 file-manager 项目中
mkdir -p packages/file-manager-ui
cd packages/file-manager-ui

# 初始化
npm init -y

# package.json
{
  "name": "@your-org/file-manager-ui",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "peerDependencies": {
    "react": "^19.0.0",
    "next": "^15.0.0"
  }
}
```

### 步骤 2: 导出组件

```typescript
// packages/file-manager-ui/src/index.ts
export { default as FileManager } from './components/FileManager';
export { default as FileTree } from './components/FileTree';
export { default as FileViewer } from './components/FileViewer';
export * from './types';
```

### 步骤 3: 在你的项目使用

```bash
npm install @your-org/file-manager-ui
```

```tsx
import { FileManager } from '@your-org/file-manager-ui';

function YourPage() {
  return <FileManager isOpen={true} onClose={() => {}} />;
}
```

**优点：**
- ✅ 最佳实践
- ✅ 易于更新
- ✅ 可复用

**缺点：**
- ⚠️ 需要构建和发布流程
- ⚠️ 初始设置复杂

---

## 🔐 认证共享方案

### 方案 A: 共享 Cookie Domain

如果两个项目在同一主域名：

```typescript
// 设置 Cookie 时使用主域名
response.cookies.set('token', token, {
  domain: '.yourdomain.com',  // 注意前面的点
  httpOnly: true,
});

// your-app.yourdomain.com 和 files.yourdomain.com 都能访问
```

### 方案 B: Token 传递

通过 URL 参数传递 Token：

```tsx
// 你的项目
const token = getToken(); // 获取当前用户的 token
window.open(`http://localhost:3003/files-only?token=${token}`);

// 文件管理项目
// app/files-only/page.tsx
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (token) {
    // 设置 token 到 cookie
    document.cookie = `token=${token}; path=/`;
  }
}, []);
```

### 方案 C: PostMessage 通信

iframe 场景下使用：

```tsx
// 你的项目（父页面）
iframe.contentWindow.postMessage({
  type: 'AUTH',
  token: yourToken
}, '*');

// 文件管理项目（iframe）
window.addEventListener('message', (event) => {
  if (event.data.type === 'AUTH') {
    setAuthToken(event.data.token);
  }
});
```

---

## 🎨 只要抽屉，不要聊天

### 修改 FileManager 组件

```tsx
// components/FileManager.tsx
export default function FileManager({
  isOpen,
  onClose,
  standalone = false  // 新增：是否独立使用
}: FileManagerProps) {

  if (standalone) {
    // 独立使用：全屏显示，不是抽屉
    return (
      <div className="h-screen w-screen flex bg-gray-800">
        {/* 文件树 */}
        <div className="w-80 border-r border-gray-700">
          <FileTree ... />
        </div>

        {/* 文件查看器 */}
        <div className="flex-1">
          <FileViewer ... />
        </div>
      </div>
    );
  }

  // 原有抽屉模式
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[80vw] bg-gray-800 z-50">
        {/* ... */}
      </div>
    </>
  );
}
```

### 在你的项目中使用

```tsx
// 你的项目
<FileManager
  isOpen={true}
  onClose={() => {}}
  standalone={true}  // 全屏模式
/>
```

---

## 📝 完整集成示例

### 你的项目结构

```
your-project/
├── app/
│   ├── page.tsx              # 你的主页
│   ├── files/page.tsx        # 文件管理页面（新增）
│   └── api/
│       └── files/            # 复制的文件 API
├── components/
│   ├── YourComponents.tsx    # 你的组件
│   └── FileManager.tsx       # 复制的文件管理
└── lib/
    └── files.ts              # 复制的文件操作
```

### 你的主页代码

```tsx
// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div>
      <h1>你的应用</h1>

      {/* 方式1: 路由导航 */}
      <button onClick={() => router.push('/files')}>
        管理文件
      </button>

      {/* 方式2: 新窗口 */}
      <button onClick={() => window.open('/files', '_blank')}>
        管理文件（新窗口）
      </button>
    </div>
  );
}
```

### 文件管理页面

```tsx
// app/files/page.tsx
'use client';

import FileManager from '@/components/FileManager';

export default function FilesPage() {
  return (
    <FileManager
      isOpen={true}
      onClose={() => window.close()}
      standalone={true}
    />
  );
}
```

---

## 🚀 推荐方案

根据你的情况，我推荐：

### 快速集成（1小时）
**方案 1: 独立路由 + iframe**
- 创建 `/files-only` 页面
- 你的项目用 iframe 嵌入
- 简单快速

### 完美集成（半天）
**方案 2: 复制组件**
- 复制必要文件到你的项目
- 修改 `FileManager` 支持 standalone 模式
- 体验最好

### 长期方案（1-2天）
**方案 3: NPM 包**
- 封装为独立包
- 可复用到多个项目
- 维护方便

---

## 📞 需要帮助？

告诉我：
1. 你的项目使用什么技术栈？
2. 你想要哪种集成方案？
3. 是否需要共享认证？

我可以提供具体的代码和步骤！

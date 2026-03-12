// ============================================
// 集成示例：在你的现有项目中使用文件管理
// ============================================

// ============================================
// 方式 1: 独立页面（推荐）
// ============================================

// 在你的现有项目中，添加一个按钮
// your-project/app/your-page/page.tsx

'use client';

import { useRouter } from 'next/navigation';

export default function YourPage() {
  const router = useRouter();

  const handleOpenFileManager = () => {
    // 方式 1a: 新标签页打开
    window.open('http://localhost:3003/files-only', '_blank');

    // 方式 1b: 当前页面跳转
    // router.push('http://localhost:3003/files-only');

    // 方式 1c: 模态窗口
    // window.open(
    //   'http://localhost:3003/files-only',
    //   'fileManager',
    //   'width=1200,height=800,left=100,top=100'
    // );
  };

  return (
    <div className="p-8">
      <h1>你的应用</h1>

      {/* 你的现有内容 */}
      <div className="my-content">
        {/* ... */}
      </div>

      {/* 文件管理按钮 */}
      <button
        onClick={handleOpenFileManager}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        📁 管理文件
      </button>
    </div>
  );
}

// ============================================
// 方式 2: iframe 嵌入
// ============================================

'use client';

import { useState } from 'react';

export default function YourPageWithIframe() {
  const [showFileManager, setShowFileManager] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      {/* 你的内容 */}
      <div className="flex-1 p-8">
        <h1>你的应用</h1>
        <button
          onClick={() => setShowFileManager(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          📁 管理文件
        </button>
      </div>

      {/* 文件管理 iframe */}
      {showFileManager && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute inset-4 bg-white rounded-lg overflow-hidden shadow-2xl">
            {/* 头部工具栏 */}
            <div className="bg-gray-800 p-4 flex items-center justify-between">
              <h2 className="text-white font-semibold">文件管理</h2>
              <button
                onClick={() => setShowFileManager(false)}
                className="text-white hover:bg-gray-700 px-3 py-1 rounded"
              >
                关闭
              </button>
            </div>

            {/* iframe */}
            <iframe
              src="http://localhost:3003/files-only"
              className="w-full h-[calc(100%-60px)] border-0"
              title="文件管理"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// 方式 3: 复制组件到你的项目
// ============================================

// 步骤 1: 复制文件到你的项目
/*
cp -r file-manager/components/FileManager.tsx your-project/components/
cp -r file-manager/components/FileTree.tsx your-project/components/
cp -r file-manager/components/FileViewer.tsx your-project/components/
cp -r file-manager/lib/files.ts your-project/lib/
cp -r file-manager/app/api/files your-project/app/api/
*/

// 步骤 2: 安装依赖
/*
npm install @monaco-editor/react jose bcryptjs
*/

// 步骤 3: 在你的页面中使用

'use client';

import { useState } from 'react';
import FileManager from '@/components/FileManager';  // 复制过来的组件

export default function YourPageWithComponent() {
  const [showFileManager, setShowFileManager] = useState(false);

  return (
    <div className="h-screen flex">
      {/* 你的内容 */}
      <div className="flex-1 p-8">
        <h1>你的应用</h1>
        <button
          onClick={() => setShowFileManager(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          📁 管理文件
        </button>
      </div>

      {/* 文件管理组件（右侧抽屉） */}
      <FileManager
        isOpen={showFileManager}
        onClose={() => setShowFileManager(false)}
      />
    </div>
  );
}

// ============================================
// 方式 4: 全屏独立页面（在你的项目中）
// ============================================

// your-project/app/files/page.tsx

'use client';

import FileManager from '@/components/FileManager';  // 复制过来的组件
import { useRouter } from 'next/navigation';

export default function FilesPage() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* 顶部工具栏 */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">文件管理</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
        >
          返回
        </button>
      </div>

      {/* 文件管理（全屏模式） */}
      <div className="flex-1 overflow-hidden">
        <FileManager
          isOpen={true}
          onClose={() => router.back()}
          standalone={true}  // 全屏模式
        />
      </div>
    </div>
  );
}

// 然后在你的页面中跳转
function YourComponent() {
  const router = useRouter();

  return (
    <button onClick={() => router.push('/files')}>
      管理文件
    </button>
  );
}

// ============================================
// 认证共享方案
// ============================================

// 如果两个项目需要共享认证状态

// 方案 A: 通过 URL 传递 Token
function openFileManagerWithAuth() {
  const token = getYourAuthToken();  // 获取你的项目的 token
  window.open(`http://localhost:3003/files-only?token=${token}`, '_blank');
}

// 文件管理项目接收 token
// file-manager/app/files-only/page.tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    // 设置 cookie 或存储到状态
    document.cookie = `token=${token}; path=/`;
  }
}, []);

// 方案 B: PostMessage 通信（iframe）
// 父页面
useEffect(() => {
  const iframe = document.getElementById('file-manager-iframe');
  iframe?.contentWindow?.postMessage({
    type: 'AUTH',
    token: yourToken,
  }, '*');
}, []);

// iframe 内部
useEffect(() => {
  window.addEventListener('message', (event) => {
    if (event.data.type === 'AUTH') {
      setAuthToken(event.data.token);
    }
  });
}, []);

// ============================================
// 完整示例：同域名部署
// ============================================

/*
假设你的架构是：
- 主应用: https://app.yourdomain.com
- 文件管理: https://files.yourdomain.com

1. 共享 Cookie Domain

// 设置 Cookie 时
response.cookies.set('token', token, {
  domain: '.yourdomain.com',  // 注意前面的点
  httpOnly: true,
});

2. 在主应用中打开文件管理

function YourComponent() {
  return (
    <button onClick={() => window.open('https://files.yourdomain.com', '_blank')}>
      管理文件
    </button>
  );
}

// 两个应用自动共享认证状态！
*/

// ============================================
// 总结推荐
// ============================================

/*
根据你的需求：

1. 快速集成（1小时）
   → 使用方式1（独立页面 + 新窗口）
   → 访问 http://localhost:3003/files-only

2. 最佳体验（半天）
   → 使用方式3（复制组件到你的项目）
   → 可以完全集成，体验最好

3. 简单嵌入（2小时）
   → 使用方式2（iframe）
   → 容易集成，但体验略差

我的建议：先用方式1快速测试，满意后再用方式3完整集成。
*/

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FileManager from '@/components/FileManager';

export default function FilesOnlyPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">文件管理</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
          >
            返回主页
          </button>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/login');
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 文件管理区域（全屏，不是抽屉） */}
      <div className="flex-1 overflow-hidden">
        <FileManager
          isOpen={true}
          onClose={() => {
            // 独立页面模式，关闭按钮返回主页
            router.push('/');
          }}
          standalone={true}
        />
      </div>
    </div>
  );
}

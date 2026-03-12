'use client';

import { useState } from 'react';
import ChatArea from '@/components/ChatArea';
import FileManager from '@/components/FileManager';

export default function Home() {
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* 聊天区域 */}
      <div className="flex-1 flex flex-col">
        <ChatArea onOpenFileManager={() => setIsFileManagerOpen(true)} />
      </div>

      {/* 文件管理侧边抽屉 */}
      <FileManager
        isOpen={isFileManagerOpen}
        onClose={() => setIsFileManagerOpen(false)}
      />
    </div>
  );
}

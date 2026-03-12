'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ChatAreaProps {
  onOpenFileManager: () => void;
}

export default function ChatArea({ onOpenFileManager }: ChatAreaProps) {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { id: 1, text: '你好！欢迎使用文件管理系统', sender: 'system' },
    { id: 2, text: '点击右上角的"管理文件"按钮可以查看和管理你的文件', sender: 'system' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // 模拟回复
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: '这是一个演示消息。你可以在右侧管理你的文件。',
          sender: 'assistant',
        },
      ]);
    }, 500);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">文件管理系统</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenFileManager}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            管理文件
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600'
                  : message.sender === 'system'
                  ? 'bg-gray-700'
                  : 'bg-gray-800'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* 输入框 */}
      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入消息..."
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
          <button
            onClick={handleSend}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}

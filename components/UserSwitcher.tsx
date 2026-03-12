'use client';

import { useState, useEffect } from 'react';

interface UserSwitcherProps {
  currentUsername: string;
  onUserChange: (userId: string) => void;
}

export default function UserSwitcher({ currentUsername, onUserChange }: UserSwitcherProps) {
  const [viewingUserId, setViewingUserId] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<string[]>([
    'user1', // demo
    'user2', // admin
    'user3', // 其他用户...
  ]);

  // 仅管理员可见
  if (currentUsername !== 'admin') {
    return null;
  }

  const handleSwitch = (targetUserId: string) => {
    setViewingUserId(targetUserId);
    onUserChange(targetUserId);
  };

  return (
    <div className="p-4 border-b border-gray-700 bg-gray-800">
      <label className="block text-sm font-medium mb-2 text-gray-300">
        👀 查看用户文件（管理员）
      </label>
      <select
        value={viewingUserId}
        onChange={(e) => handleSwitch(e.target.value)}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
      >
        <option value="">我的文件</option>
        <option value="user1">Demo 用户 (user1)</option>
        <option value="user2">Admin 用户 (user2)</option>
        <option value="user3">其他用户 (user3)</option>
      </select>
      {viewingUserId && (
        <p className="text-xs text-yellow-400 mt-2">
          ⚠️ 正在查看 {viewingUserId} 的文件
        </p>
      )}
    </div>
  );
}

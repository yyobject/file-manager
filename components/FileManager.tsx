'use client';

import { useState, useEffect } from 'react';
import FileTree from './FileTree';
import FileViewer from './FileViewer';
import { FileNode } from '@/lib/files';

interface FileManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FileManager({ isOpen, onClose }: FileManagerProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 加载文件列表
  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const maxSize = 100 * 1024 * 1024; // 100MB
    const failedFiles: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // 检查文件大小
        if (file.size > maxSize) {
          failedFiles.push(`${file.name} (超过 100MB)`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', '');

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          failedFiles.push(`${file.name} (${data.error || '上传失败'})`);
        }
      }

      // 重新加载文件列表
      await loadFiles();

      // 显示结果
      if (failedFiles.length > 0) {
        alert(`部分文件上传失败:\n${failedFiles.join('\n')}`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('上传失败');
    } finally {
      setUploading(false);
      event.target.value = ''; // 重置 input
    }
  };

  // 创建新文件夹
  const handleCreateFolder = async () => {
    const name = prompt('请输入文件夹名称：');
    if (!name) return;

    try {
      await fetch('/api/files/mkdir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '', name }),
      });

      await loadFiles();
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('创建文件夹失败');
    }
  };

  // 删除文件
  const handleDeleteFile = async (file: FileNode) => {
    if (!confirm(`确定要删除 ${file.name} 吗？`)) return;

    try {
      await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path }),
      });

      if (selectedFile?.path === file.path) {
        setSelectedFile(null);
      }

      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('删除失败');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* 侧边抽屉 */}
      <div className="fixed right-0 top-0 h-full w-[80vw] bg-gray-800 shadow-2xl z-50 flex">
        {/* 文件树区域 */}
        <div className="w-80 border-r border-gray-700 flex flex-col">
          {/* 头部 */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">我的文件</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <label className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-center cursor-pointer transition-colors">
                {uploading ? '上传中...' : '上传文件'}
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <button
                onClick={handleCreateFolder}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                新建文件夹
              </button>
            </div>
          </div>

          {/* 文件树 */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">加载中...</div>
              </div>
            ) : (
              <FileTree
                files={files}
                selectedFile={selectedFile}
                onSelectFile={setSelectedFile}
                onDeleteFile={handleDeleteFile}
                onRefresh={loadFiles}
              />
            )}
          </div>
        </div>

        {/* 文件预览/编辑区域 */}
        <div className="flex-1 overflow-hidden">
          <FileViewer
            file={selectedFile}
            onSave={loadFiles}
            onClose={() => setSelectedFile(null)}
          />
        </div>
      </div>
    </>
  );
}

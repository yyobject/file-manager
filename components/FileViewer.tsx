'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FileNode } from '@/lib/files';

// 动态导入 Monaco Editor（仅客户端）
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">加载编辑器...</div>,
});

interface FileViewerProps {
  file: FileNode | null;
  onSave: () => void;
  onClose: () => void;
}

export default function FileViewer({ file, onSave, onClose }: FileViewerProps) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileType, setFileType] = useState<'text' | 'image' | 'video' | 'unknown'>('unknown');

  // 获取文件语言类型
  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      json: 'json',
      html: 'html',
      css: 'css',
      md: 'markdown',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rs: 'rust',
      sh: 'shell',
      txt: 'plaintext',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  // 判断文件类型
  const detectFileType = (filename: string): 'text' | 'image' | 'video' | 'unknown' => {
    const ext = filename.split('.').pop()?.toLowerCase();

    const textExts = ['txt', 'js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'md', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'sh', 'xml', 'yaml', 'yml'];
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'];
    const videoExts = ['mp4', 'webm', 'ogg', 'mov'];

    if (textExts.includes(ext || '')) return 'text';
    if (imageExts.includes(ext || '')) return 'image';
    if (videoExts.includes(ext || '')) return 'video';
    return 'unknown';
  };

  // 加载文件内容
  useEffect(() => {
    if (!file) {
      setContent('');
      setOriginalContent('');
      setFileType('unknown');
      return;
    }

    const type = detectFileType(file.name);
    setFileType(type);

    if (type === 'text') {
      setLoading(true);
      fetch(`/api/files/read?path=${encodeURIComponent(file.path)}`)
        .then((res) => res.json())
        .then((data) => {
          setContent(data.content || '');
          setOriginalContent(data.content || '');
        })
        .catch((error) => {
          console.error('Error loading file:', error);
          setContent('加载失败');
        })
        .finally(() => setLoading(false));
    }
  }, [file]);

  // 保存文件
  const handleSave = async () => {
    if (!file || content === originalContent) return;

    setSaving(true);
    try {
      const response = await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path, content }),
      });

      if (response.ok) {
        setOriginalContent(content);
        onSave();
      } else {
        alert('保存失败');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 快捷键保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, originalContent, file]);

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-4 opacity-50"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <p className="text-lg">选择一个文件查看</p>
      </div>
    );
  }

  const isDirty = content !== originalContent;

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">{file.name}</h3>
          {isDirty && <span className="text-orange-400 text-sm">● 未保存</span>}
        </div>
        <div className="flex items-center gap-2">
          {fileType === 'text' && (
            <button
              onClick={handleSave}
              disabled={!isDirty || saving}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存 (Cmd+S)'}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">加载中...</div>
          </div>
        ) : fileType === 'text' ? (
          <MonacoEditor
            height="100%"
            language={getLanguage(file.name)}
            value={content}
            onChange={(value) => setContent(value || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
            }}
          />
        ) : fileType === 'image' ? (
          <div className="flex items-center justify-center h-full p-8 bg-gray-900">
            <img
              src={`/api/files/read?path=${encodeURIComponent(file.path)}`}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : fileType === 'video' ? (
          <div className="flex items-center justify-center h-full p-8 bg-gray-900">
            <video
              src={`/api/files/read?path=${encodeURIComponent(file.path)}`}
              controls
              className="max-w-full max-h-full"
            >
              您的浏览器不支持视频播放。
            </video>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-3 opacity-50"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p>不支持预览此文件类型</p>
            <p className="text-sm mt-1 text-gray-500">文件大小: {(file.size || 0) / 1024}KB</p>
          </div>
        )}
      </div>
    </div>
  );
}

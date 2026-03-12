import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const USER_FILES_ROOT = process.env.USER_FILES_ROOT || './user-files';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  modifiedAt?: string;
  children?: FileNode[];
}

// 获取用户文件目录路径
export function getUserFilesPath(userId: string): string {
  return path.join(process.cwd(), USER_FILES_ROOT, userId);
}

// 确保用户目录存在
export async function ensureUserDirectory(userId: string): Promise<void> {
  const userPath = getUserFilesPath(userId);
  if (!existsSync(userPath)) {
    await fs.mkdir(userPath, { recursive: true });
  }
}

// 验证路径安全性（防止路径遍历攻击）
export function isPathSafe(userId: string, filePath: string): boolean {
  const userPath = getUserFilesPath(userId);
  const fullPath = path.join(userPath, filePath);
  const normalizedPath = path.normalize(fullPath);
  return normalizedPath.startsWith(userPath);
}

// 获取文件树
export async function getFileTree(
  userId: string,
  relativePath: string = ''
): Promise<FileNode[]> {
  await ensureUserDirectory(userId);

  const userPath = getUserFilesPath(userId);
  const fullPath = path.join(userPath, relativePath);

  if (!isPathSafe(userId, relativePath)) {
    throw new Error('Invalid path');
  }

  try {
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const entry of entries) {
      const entryPath = path.join(relativePath, entry.name);
      const stats = await fs.stat(path.join(userPath, entryPath));

      const node: FileNode = {
        name: entry.name,
        path: entryPath,
        type: entry.isDirectory() ? 'folder' : 'file',
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
      };

      if (entry.isDirectory()) {
        node.children = await getFileTree(userId, entryPath);
      }

      nodes.push(node);
    }

    return nodes.sort((a, b) => {
      // 文件夹排在前面
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
}

// 读取文件内容
export async function readFile(
  userId: string,
  filePath: string
): Promise<string | Buffer> {
  if (!isPathSafe(userId, filePath)) {
    throw new Error('Invalid path');
  }

  const fullPath = path.join(getUserFilesPath(userId), filePath);

  try {
    const content = await fs.readFile(fullPath);
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error('File not found');
  }
}

// 写入文件内容
export async function writeFile(
  userId: string,
  filePath: string,
  content: string | Buffer
): Promise<void> {
  if (!isPathSafe(userId, filePath)) {
    throw new Error('Invalid path');
  }

  const fullPath = path.join(getUserFilesPath(userId), filePath);
  const dirPath = path.dirname(fullPath);

  try {
    // 确保目录存在
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(fullPath, content);
  } catch (error) {
    console.error('Error writing file:', error);
    throw new Error('Failed to save file');
  }
}

// 创建文件夹
export async function createFolder(
  userId: string,
  folderPath: string
): Promise<void> {
  if (!isPathSafe(userId, folderPath)) {
    throw new Error('Invalid path');
  }

  const fullPath = path.join(getUserFilesPath(userId), folderPath);

  try {
    await fs.mkdir(fullPath, { recursive: true });
  } catch (error) {
    console.error('Error creating folder:', error);
    throw new Error('Failed to create folder');
  }
}

// 删除文件或文件夹
export async function deleteFile(
  userId: string,
  filePath: string
): Promise<void> {
  if (!isPathSafe(userId, filePath)) {
    throw new Error('Invalid path');
  }

  const fullPath = path.join(getUserFilesPath(userId), filePath);

  try {
    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      await fs.rm(fullPath, { recursive: true });
    } else {
      await fs.unlink(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

// 重命名文件或文件夹
export async function renameFile(
  userId: string,
  oldPath: string,
  newPath: string
): Promise<void> {
  if (!isPathSafe(userId, oldPath) || !isPathSafe(userId, newPath)) {
    throw new Error('Invalid path');
  }

  const fullOldPath = path.join(getUserFilesPath(userId), oldPath);
  const fullNewPath = path.join(getUserFilesPath(userId), newPath);

  try {
    await fs.rename(fullOldPath, fullNewPath);
  } catch (error) {
    console.error('Error renaming file:', error);
    throw new Error('Failed to rename file');
  }
}

// 获取文件 MIME 类型
export function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.txt': 'text/plain',
    '.js': 'text/javascript',
    '.ts': 'text/typescript',
    '.jsx': 'text/javascript',
    '.tsx': 'text/typescript',
    '.json': 'application/json',
    '.html': 'text/html',
    '.css': 'text/css',
    '.md': 'text/markdown',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// 判断是否为文本文件
export function isTextFile(filename: string): boolean {
  const textExtensions = [
    '.txt', '.js', '.ts', '.jsx', '.tsx', '.json', '.html', '.css',
    '.md', '.xml', '.yaml', '.yml', '.env', '.sh', '.py', '.java',
    '.cpp', '.c', '.go', '.rs', '.php', '.rb', '.swift', '.kt'
  ];
  const ext = path.extname(filename).toLowerCase();
  return textExtensions.includes(ext);
}

// 判断是否为图片文件
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico'];
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

// 判断是否为视频文件
export function isVideoFile(filename: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const ext = path.extname(filename).toLowerCase();
  return videoExtensions.includes(ext);
}

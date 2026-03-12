import { NextRequest, NextResponse } from 'next/server';
import { writeFile as fsWriteFile, mkdir } from 'fs/promises';
import path from 'path';
import { getUserFilesPath } from '@/lib/files';

// 配置路由段选项 - 允许大文件上传
export const runtime = 'nodejs';
export const maxDuration = 60; // 最大执行时间 60 秒

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取内容类型
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('Failed to parse FormData:', error);
      return NextResponse.json(
        { error: 'Failed to parse form data. File might be too large.' },
        { status: 413 }
      );
    }

    const file = formData.get('file') as File;
    const uploadPath = formData.get('path') as string || '';

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // 检查文件大小 (100MB)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '104857600');
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` },
        { status: 413 }
      );
    }

    // 获取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 构建保存路径
    const userPath = getUserFilesPath(userId);
    const targetDir = path.join(userPath, uploadPath);
    const fullPath = path.join(targetDir, file.name);

    // 确保目录存在
    await mkdir(targetDir, { recursive: true });

    // 保存文件
    await fsWriteFile(fullPath, buffer);

    return NextResponse.json({
      success: true,
      filename: file.name,
      path: path.join(uploadPath, file.name),
      size: file.size,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

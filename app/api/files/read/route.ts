import { NextRequest, NextResponse } from 'next/server';
import { readFile, isTextFile, getMimeType } from '@/lib/files';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    const content = await readFile(userId, filePath);
    const mimeType = getMimeType(filePath);

    // 如果是文本文件，返回 JSON
    if (isTextFile(filePath)) {
      return NextResponse.json({
        content: content.toString('utf-8'),
        mimeType,
      });
    }

    // 否则返回二进制内容
    return new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
      },
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }
}

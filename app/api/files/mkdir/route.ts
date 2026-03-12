import { NextRequest, NextResponse } from 'next/server';
import { createFolder } from '@/lib/files';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { path: folderPath, name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const fullPath = folderPath ? `${folderPath}/${name}` : name;
    await createFolder(userId, fullPath);

    return NextResponse.json({ success: true, path: fullPath });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}

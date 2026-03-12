import { NextRequest, NextResponse } from 'next/server';
import { getFileTree } from '@/lib/files';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path') || '';

    const files = await getFileTree(userId, path);

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error getting files:', error);
    return NextResponse.json(
      { error: 'Failed to get files' },
      { status: 500 }
    );
  }
}

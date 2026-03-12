import { NextRequest, NextResponse } from 'next/server';

// 切换查看用户（仅管理员）
export async function POST(request: NextRequest) {
  try {
    const currentUserId = request.headers.get('x-user-id');
    const currentUsername = request.headers.get('x-username');

    // 检查是否是管理员
    if (currentUsername !== 'admin') {
      return NextResponse.json(
        { error: 'Only admin can switch user view' },
        { status: 403 }
      );
    }

    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      );
    }

    // 返回目标用户ID（前端会用这个ID请求文件）
    return NextResponse.json({
      success: true,
      viewingUserId: targetUserId,
      currentUserId,
    });
  } catch (error) {
    console.error('Error switching user view:', error);
    return NextResponse.json(
      { error: 'Failed to switch user view' },
      { status: 500 }
    );
  }
}

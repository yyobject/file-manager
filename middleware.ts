import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

interface TokenPayload {
  userId: string;
  username: string;
  email: string;
}

// 在 Middleware 中使用 jose 验证 token（Edge Runtime 兼容）
async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  // 公开路径，不需要认证
  const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 获取 token
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // 如果是 API 请求，返回 401
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // 否则重定向到登录页
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 验证 token（异步）
  const payload = await verifyToken(token);
  if (!payload) {
    // Token 无效
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Token 有效，添加用户信息到请求头
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-username', payload.username);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

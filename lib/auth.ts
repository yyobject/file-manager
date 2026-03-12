import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
}

// 生成 JWT Token（使用 jose）
export async function generateToken(user: User): Promise<string> {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d') // 7天过期
    .sign(JWT_SECRET);

  return token;
}

// 哈希密码
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// 验证密码
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// 模拟用户数据库（生产环境应该用真实数据库）
const users: Map<string, User & { password: string }> = new Map();

// 初始化测试用户（延迟初始化）
let usersInitialized = false;
async function initUsers() {
  if (usersInitialized) return;

  users.set('user1', {
    id: 'user1',
    username: 'demo',
    email: 'demo@example.com',
    password: await hashPassword('demo123'), // 密码: demo123
  });

  users.set('user2', {
    id: 'user2',
    username: 'admin',
    email: 'admin@example.com',
    password: await hashPassword('admin123'), // 密码: admin123
  });

  usersInitialized = true;
}

// 用户登录
export async function loginUser(
  username: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  await initUsers(); // 确保用户已初始化

  const user = Array.from(users.values()).find(
    (u) => u.username === username || u.email === username
  );

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return null;
  }

  const { password: _, ...userWithoutPassword } = user;
  const token = await generateToken(userWithoutPassword);

  return {
    user: userWithoutPassword,
    token,
  };
}

// 注册用户
export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  // 检查用户名是否已存在
  const existingUser = Array.from(users.values()).find(
    (u) => u.username === username || u.email === email
  );

  if (existingUser) {
    return null;
  }

  const userId = `user${users.size + 1}`;
  const hashedPassword = await hashPassword(password);

  const newUser: User & { password: string } = {
    id: userId,
    username,
    email,
    password: hashedPassword,
  };

  users.set(userId, newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  const token = await generateToken(userWithoutPassword);

  return {
    user: userWithoutPassword,
    token,
  };
}

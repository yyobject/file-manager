import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'File Manager - 文件管理系统',
  description: 'A secure file management system with user authentication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

# 如何启动服务器

## 方法 1：使用启动脚本（推荐）

```bash
cd /Users/tezign/Documents/file-manager
./start.sh
```

## 方法 2：手动启动

```bash
cd /Users/tezign/Documents/file-manager

# 确保使用 Node.js 20
nvm use 20.19.0

# 启动开发服务器
npm run dev
```

## 方法 3：新终端窗口启动

1. 打开新的终端窗口
2. 执行以下命令：

```bash
cd /Users/tezign/Documents/file-manager && nvm use 20.19.0 && npm run dev
```

---

## 访问应用

服务器启动后，访问：**http://localhost:3000**

## 测试账号

```
用户名: demo
密码: demo123
```

或

```
用户名: admin
密码: admin123
```

## 停止服务器

在运行服务器的终端窗口中按 `Ctrl+C`

---

## 常见问题

### Q: 端口被占用？
A: 如果 3000 端口被占用，Next.js 会自动使用其他端口（如 3001, 3004 等）。查看终端输出的实际端口号。

### Q: 找不到 nvm 命令？
A: 确保已安装 nvm。如果没有，可以直接使用系统的 Node.js（需要 20+）：
```bash
node --version  # 检查版本
npm run dev     # 如果是 20+，直接运行
```

### Q: 服务器启动后自动退出？
A: 确保在终端窗口中运行，而不是后台运行。服务器需要保持终端窗口打开。

---

## 验证服务器运行

服务器成功启动后，你会看到：

```
✓ Ready in 3-5s
- Local:        http://localhost:3000
```

保持这个终端窗口打开，然后在浏览器中访问显示的地址。

#!/bin/bash

# 启动 Next.js 开发服务器

# 加载 nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 使用 Node.js 20
nvm use 20.19.0

# 启动服务器
npm run dev

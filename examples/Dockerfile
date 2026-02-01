# ---------------------------------------------------------
# Stage 1: Builder (Node.js)
# 依存関係のインストール、ビルド、暗号化を行う
# ---------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# プロジェクト全体のファイルをコピー
# .dockerignore で node_modules 等は除外されている前提だが、
# ここでは明示的に必要なものをコピーする方が安全かもしれない。
# いったん全てコピーする。
COPY . .


# 依存関係のインストール
RUN npm install

# パッケージのビルド
RUN npm run build

# 暗号化の実行
# examples/site -> examples/dist
RUN node packages/cli/dist/index.js encrypt \
    --input-dir examples/site \
    --output-dir examples/dist \
    --password 'password123' \
  --title 'My Secret Site'

# ---------------------------------------------------------
# Stage 2: Runner (Nginx)
# 暗号化された静的ファイルを配信する
# ---------------------------------------------------------
FROM nginx:alpine

# Builder ステージから暗号化済みファイル (examples/dist) をコピー
COPY --from=builder /app/examples/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
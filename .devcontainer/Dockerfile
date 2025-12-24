FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bookworm

WORKDIR /workspaces/mayaallan-site

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

EXPOSE 3000

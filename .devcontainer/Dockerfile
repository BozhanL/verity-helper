FROM mcr.microsoft.com/devcontainers/typescript-node:5-24-bookworm

# Match package.json's npm engine and include the official Codex CLI.
ARG NPM_VERSION=11.11.0
ARG CODEX_VERSION=0.163.0
RUN npm install --global npm@${NPM_VERSION} @openai/codex@${CODEX_VERSION} \
    && npm cache clean --force

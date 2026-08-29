FROM mcr.microsoft.com/devcontainers/typescript-node:22-bookworm

ARG NODE_VERSION="22.22"
RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${NODE_VERSION} && nvm alias default ${NODE_VERSION}"

# Install latest npm & global Angular CLI
RUN npm install -g npm@latest @angular/cli@latest

# Install system dependencies required by Playwright headless browsers
RUN apt-get update && apt-get install -y \
    libx11-xcb1 \
    libxrandr2 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxfixes3 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libasound2 \
    libdbus-1-3 \
    && rm -rf /var/lib/apt-get/lists/*

EXPOSE 4200

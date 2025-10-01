FROM node:20-alpine

WORKDIR /usr/src/app

# Copy manifests; lockfile is optional
COPY package.json package-lock.json* ./

# If lockfile exists → ci; otherwise → install
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm install --no-audit --no-fund; \
    fi

# Copy source (will be bind-mounted in dev)
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

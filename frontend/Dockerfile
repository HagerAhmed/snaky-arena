# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files first for caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the project
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy the build output from the previous stage
# Vite output defaults to /dist
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

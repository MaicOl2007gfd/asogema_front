# ============================================================
# STAGE 1: Build the Vue + Vite application
# ============================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the application for production
RUN npm run build

# ============================================================
# STAGE 2: Serve with Nginx
# ============================================================
FROM nginx:1.27-alpine

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

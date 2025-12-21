# ---------- Build ----------
    FROM node:20-alpine AS build
    WORKDIR /app
    
    COPY package.json package-lock.json ./
    RUN npm ci
    
    COPY . .
    COPY .env.prod .env.production
    
    RUN npm run build
    
    # ---------- Runtime ----------
    FROM nginx:alpine
    RUN rm /etc/nginx/conf.d/default.conf
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    COPY --from=build /app/dist /usr/share/nginx/html
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    
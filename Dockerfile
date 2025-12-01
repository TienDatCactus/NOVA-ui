FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
ARG VITE_API_URL
ARG VITE_CHAT_HUB_URL
ARG VITE_APP_BASE_URL
ENV VITE_API_URL=$VITE_API_URL \
    VITE_CHAT_HUB_URL=$VITE_CHAT_HUB_URL \
    VITE_APP_BASE_URL=$VITE_APP_BASE_URL
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:20-alpine
ENV PORT=3000 \
    HOST=0.0.0.0
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY server.mjs /app/server.mjs
WORKDIR /app
EXPOSE 3000
CMD ["node", "server.mjs"]

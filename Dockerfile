FROM node:22-bookworm-slim AS api-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY web ./web
RUN npm run build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=api-build /app/dist ./dist
COPY --from=api-build /app/public ./public
USER node
EXPOSE 3000
CMD ["node","dist/server.js"]

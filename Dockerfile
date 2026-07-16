FROM node:20-alpine AS frontend-build
WORKDIR /app/web-portal
COPY web-portal/package*.json ./
RUN npm ci
COPY web-portal/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
COPY --from=frontend-build /app/web-portal/dist ./web-portal/dist
EXPOSE 3000
CMD ["node", "index.js"]

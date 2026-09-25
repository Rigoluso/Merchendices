FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server.mjs ./

USER node
EXPOSE 3000

CMD ["node", "server.mjs"]

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
EXPOSE 3001

# Si tu entry es server.js, déjalo así:
CMD ["node", "server.js"]

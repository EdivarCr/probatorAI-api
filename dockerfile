
FROM node:20-slim AS development
WORKDIR /usr/src/app

# Copia arquivos de dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm install


COPY . .


RUN npx prisma generate


CMD ["npm", "run", "start:dev"]


FROM development AS builder

RUN npm run build

# ---

# Estágio Final: Produção
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
# Instala apenas o necessário para rodar (sem devDependencies)
RUN npm install --only=production

# Copia o build e o cliente do Prisma gerado
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3000
CMD ["node", "dist/main.js"]
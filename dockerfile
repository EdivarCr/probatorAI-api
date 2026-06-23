FROM node:20-slim AS development
WORKDIR /usr/src/app

# 1. Instala o OpenSSL necessário para o Prisma funcionar na imagem slim
RUN apt-get update -y && apt-get install -y openssl-dev openssl direntry || apt-get install -y openssl

# 2. Copia os arquivos de dependências
COPY package*.json ./

# 3. CRUCIAL: Copia a pasta do prisma ANTES do npm install 
# Isso garante que o script 'postinstall' (prisma generate) encontre o schema.prisma
COPY prisma ./prisma/

# 4. Agora o npm install vai rodar e o prisma generate vai funcionar perfeitamente
RUN npm install

# 5. Copia o restante dos arquivos do projeto
COPY . .

# 6. Esta linha agora se torna redundante porque o postinstall já gera o prisma, 
# mas mantê-la garante que esteja tudo atualizado se houver mudanças
RUN npx prisma generate

CMD ["npm", "run", "start:dev"]


FROM development AS builder
RUN npm run build

# ---
# Estágio Final: Produção
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Alpine precisa de uma lib específica para o Prisma funcionar em prod
RUN apk add --no-cache openssl

COPY package*.json ./
# O cliente Prisma já foi gerado no estágio "builder" e é copiado abaixo;
# removemos o postinstall aqui porque "prisma" (CLI) é devDependency e não
# está disponível num install --only=production, o que quebraria o build.
RUN npm pkg delete scripts.postinstall && npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3000
CMD ["node", "dist/main.js"]
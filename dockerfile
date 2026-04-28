# Estágio 1: Build
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Produção (Imagem mais leve)
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
# Instala apenas as dependências de produção
RUN npm install --only=production
# Copia apenas o build compilado do estágio anterior
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
# Aponta diretamente para o arquivo compilado
CMD ["node", "dist/main.js"]
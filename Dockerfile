FROM node:20-alpine

WORKDIR /app

# Instalar dependências necessárias para o Prisma (OpenSSL) e build
RUN apk add --no-cache openssl libc6-compat

# Copiar arquivos de configuração de dependências
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install

# Gerar o cliente do Prisma
RUN npx prisma generate

# Copiar o restante do código
COPY . .

# Buildar a aplicação NestJS
RUN npm run build

# Expor a porta
EXPOSE 3000

# Comando para rodar a aplicação em produção
CMD ["npm", "run", "start:prod"]

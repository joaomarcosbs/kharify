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
EXPOSE 3080

# Comando para rodar migrações e iniciar a aplicação em produção
CMD ["sh", "-c", "node scripts/ensure-app-role.js && DATABASE_URL=\"$DATABASE_ADMIN_URL\" npx prisma migrate deploy && npm run start:prod"]

FROM node:22

WORKDIR /usr/src/app

# Habilita o corepack e ativa o pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instala dependências nativas
RUN apt-get update && apt-get install -y python3 make g++ libssl-dev

# Copia lockfile e manifestos primeiro (melhora cache)
COPY pnpm-lock.yaml ./
COPY package.json ./

# Instala as dependências
RUN pnpm install

# Copia o restante do projeto
COPY . .

# Permissão para script de espera do banco
COPY wait-for-db.sh /usr/src/app/wait-for-db.sh
RUN chmod +x /usr/src/app/wait-for-db.sh

# Gera o Prisma Client
RUN pnpm prisma generate

EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]

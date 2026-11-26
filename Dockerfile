FROM node:22-alpine

# Dependências para compilar better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar dependências
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copiar código fonte
COPY . .

# Criar diretório de dados persistente
RUN mkdir -p data

# Comando de inicialização
CMD ["node", "src/index.js"]

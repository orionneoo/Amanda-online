FROM node:18-slim

WORKDIR /app

# Instala as dependências necessárias para o Baileys
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copia os arquivos de configuração primeiro
COPY package*.json ./
COPY tsconfig.json ./
COPY .npmrc ./

# Instala as dependências
RUN npm install

# Copia o resto do código
COPY . .

# Compila o TypeScript
RUN npm run build

# Comando para iniciar o bot
CMD ["npm", "start"] 
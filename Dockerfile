FROM node:18-slim

WORKDIR /app

# Instala as dependências necessárias para o Baileys e build
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Cria um usuário não-root
RUN groupadd -r amanda && useradd -r -g amanda -G audio,video amanda \
    && mkdir -p /home/amanda \
    && chown -R amanda:amanda /home/amanda \
    && chown -R amanda:amanda /app

# Configura npm para usar o novo usuário
RUN npm config set unsafe-perm true

# Copia os arquivos de configuração primeiro
COPY --chown=amanda:amanda package*.json ./
COPY --chown=amanda:amanda tsconfig.json ./
COPY --chown=amanda:amanda .npmrc ./

# Muda para o usuário não-root
USER amanda

# Instala as dependências com flags específicas
RUN npm install --no-optional --legacy-peer-deps

# Copia o resto do código
COPY --chown=amanda:amanda . .

# Compila o TypeScript
RUN npm run build

# Define as variáveis de ambiente necessárias
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Comando para iniciar o bot
CMD ["npm", "start"] 
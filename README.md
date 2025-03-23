# 🤖 Amanda BOT

Um bot avançado para WhatsApp com recursos de IA, sistema de economia, análise de imagens e muito mais.

## 📋 Índice
- [Funcionalidades](#-funcionalidades)
- [Requisitos](#-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Comandos](#-comandos)
- [Sistema CBCoin](#-sistema-cbcoin)
- [Análise de Imagens](#-análise-de-imagens)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## 🚀 Funcionalidades

### 🤖 Core
- Conexão automática com WhatsApp
- Sistema de reconexão inteligente
- Gerenciamento de sessões
- Sistema de filas para mensagens
- Logging avançado

### 🖼️ Análise de Imagens
- Integração com Gemini Vision API
- Análise detalhada de imagens
- Respostas personalizadas por grupo
- Suporte a múltiplos formatos

### 💬 Resumo de Conversas
- Resumo das últimas 12 horas
- Identificação de participantes ativos
- Marcação automática de usuários
- Análise de interações

### 💰 Sistema CBCoin
- Moeda virtual do bot
- Sistema de daily rewards
- Apostas e jogos
- Ranking global
- Sistema de loja
- Transferências entre usuários

### 👥 Gestão de Grupos
- Comandos administrativos
- Sistema de regras
- Controle de membros
- Configurações personalizadas
- Anti-link e proteções

## ⚙️ Requisitos

- Node.js 18+
- MongoDB
- FFmpeg
- Python 3
- Gemini API Key

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/orionneoo/Amanda-online.git
cd Amanda-online
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo .env:
```env
MONGODB_URI=sua_uri_mongodb
GEMINI_API_KEY=sua_chave_gemini
```

4. Compile o projeto:
```bash
npm run build
```

5. Inicie o bot:
```bash
npm start
```

## ⚙️ Configuração

### Estrutura do .env
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/amanda_bot

# APIs
GEMINI_API_KEY=sua_chave_gemini

# Bot
NODE_ENV=production
LOG_LEVEL=info
MAX_RETRIES=3
RATE_LIMIT=60

# Performance
NODE_OPTIONS="--max-old-space-size=2048"
ENABLE_QUEUE=true
MAX_CONCURRENT=5
```

### Personalização
- `PersonBOT/sys_inst.default.config`: Configuração padrão
- `PersonBOT/sys_inst.{GROUP_ID}.config`: Configuração por grupo

## 📝 Comandos

### Menu Principal (!menu)
- Menu de IA (!menu ia)
- Menu de Jogos (!menu jogos)
- Menu de Grupo (!menu grupo)
- Menu de Configurações (!menu config)

### Análise de Imagens
- Envie imagem com legenda mencionando "amanda"
- Responda imagem mencionando "amanda"
- Em privado, apenas envie a imagem

### Sistema CBCoin
- !cbcoin - Ver saldo
- !daily - Recompensa diária
- !apostar [valor] - Apostar
- !ranking - Ver ranking
- !shop - Ver loja
- !presente [@user] [valor] - Transferir

### Comandos de Grupo
- !info - Informações
- !regras - Ver/definir regras
- !admins - Listar admins
- !resumir - Resumo de conversas

## 💰 Sistema CBCoin

### Economia
- Moeda virtual do bot
- Daily rewards: 1000 coins
- Sistema de apostas
- Loja com itens especiais

### Itens da Loja
- VIP Status (10000 coins)
- Título Personalizado (5000 coins)
- Imunidade (3000 coins)

### Apostas
- Valor mínimo: 100 coins
- Chance de vitória: 50%
- Multiplicador: 2x

## 🖼️ Análise de Imagens

### Funcionalidades
- Análise detalhada usando Gemini Vision
- Descrição em português
- Personalidade por grupo
- Detecção de elementos
- Análise de cores e ambiente

### Personalização
- Tom casual ou formal
- Foco em detalhes relevantes
- Respostas contextualizadas
- Integração com grupo

## 📁 Estrutura do Projeto

```
├── commands/
│   ├── admin/         # Comandos administrativos
│   ├── games/         # Sistema CBCoin
│   ├── menu.ts        # Sistema de menus
│   └── vision/        # Análise de imagens
├── database/
│   └── mongodb.ts     # Conexão MongoDB
├── PersonBOT/
│   └── sys_inst.*.config  # Configurações
├── logs/              # Logs do sistema
├── index.ts          # Ponto de entrada
└── AmandaBOT.ts      # Core do bot
```

### Componentes Principais

#### 1. Core (index.ts)
- Conexão com WhatsApp
- Sistema de filas
- Gerenciamento de sessão
- Logging

#### 2. Comandos
- Sistema modular
- Handlers específicos
- Validações
- Respostas formatadas

#### 3. Database
- MongoDB para persistência
- Cache em memória
- Schemas otimizados

#### 4. Logging
- Sistema detalhado
- Rotação de logs
- Níveis diferentes
- Formatação clara

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua branch: `git checkout -b feature/NovaFuncionalidade`
3. Commit suas mudanças: `git commit -m 'Add: nova funcionalidade'`
4. Push para a branch: `git push origin feature/NovaFuncionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ⚠️ Notas Importantes

### Segurança
- Nunca compartilhe suas chaves de API
- Mantenha o .env seguro
- Faça backup regular do banco
- Monitore os logs

### Performance
- Use Node.js 18+
- Configure limites de memória
- Monitore uso de CPU
- Mantenha dependências atualizadas

### Manutenção
- Verifique logs regularmente
- Faça backup do banco de dados
- Atualize as dependências
- Monitore uso da API

## 👥 Suporte

Para suporte, entre em contato através das issues do GitHub ou pelo WhatsApp do desenvolvedor.

## 🙏 Agradecimentos

- [WhatsApp Web API](https://github.com/whiskeysockets/baileys)
- [Google Gemini](https://cloud.google.com/vertex-ai)
- [MongoDB](https://www.mongodb.com)
- [Node.js](https://nodejs.org)

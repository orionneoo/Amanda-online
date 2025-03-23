# 🤖 Amanda BOT

Bot para WhatsApp com funcionalidades avançadas de análise de imagens e resumo de conversas.

## 🚀 Funcionalidades

### 📷 Análise de Imagens
- Análise detalhada de imagens usando Gemini Vision API
- Respostas personalizadas baseadas na personalidade do grupo
- Suporte para envio direto ou resposta a imagens
- Descrições detalhadas em português

### 📝 Resumo de Conversas (!resumir)
- Resumo das últimas 12 horas de conversa
- Identificação dos participantes mais ativos
- Marcação automática de usuários (@pessoa)
- Destaque para interações entre admins e membros
- Respostas personalizadas por grupo

### 👥 Gestão de Grupos
- Armazenamento de informações dos grupos
- Controle de admins e membros
- Personalidades customizadas por grupo
- Sistema de configuração flexível

## 🚀 Tecnologias

- Node.js
- TypeScript
- Baileys (WhatsApp Web API)
- Google Gemini API
- MongoDB

## 📋 Pré-requisitos

- Node.js 16+
- MongoDB
- Chave da API Gemini

## ⚙️ Configuração

### Requisitos
- Node.js 16+
- MongoDB
- FFmpeg
- Python 3

### Variáveis de Ambiente (.env)
```env
MONGODB_URI=sua_uri_mongodb
GEMINI_API_KEY=sua_chave_gemini
```

### Arquivos de Configuração
- `PersonBOT/sys_inst.default.config`: Configuração padrão
- `PersonBOT/sys_inst.{GROUP_ID}.config`: Configuração específica por grupo

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

3. Configure o arquivo .env com suas credenciais

4. Compile o projeto:
```bash
npm run build
```

5. Inicie o bot:
```bash
npm start
```

## 📚 Estrutura do Projeto

```
├── commands/
│   ├── chat/
│   │   └── summarizer.ts    # Comando !resumir
│   └── vision/
│       └── imageAnalyzer.ts # Análise de imagens
├── database/
│   └── mongodb.ts          # Gerenciamento do banco de dados
├── PersonBOT/
│   └── sys_inst.*.config   # Configurações de personalidade
└── index.ts               # Ponto de entrada
```

## 🔧 Comandos Disponíveis

### Análise de Imagens
- Envie uma imagem com legenda mencionando "amanda" ou "amandinha"
- Responda a uma imagem mencionando "amanda" ou "amandinha"
- Em conversas privadas, apenas envie a imagem

### Resumo de Conversas
- `!resumir`: Gera um resumo das últimas 12 horas de conversa

## 🗄️ Banco de Dados

### Coleções MongoDB
- `groups`: Informações dos grupos
- `users`: Dados dos usuários
- `messages`: Histórico de mensagens

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ⚠️ Notas Importantes

- Configure corretamente as permissões do FFmpeg
- Mantenha o Node.js atualizado
- Faça backup regular do banco de dados
- Monitore o uso da API do Gemini

## 👤 Autor

- GitHub: [@orionneoo](https://github.com/orionneoo)

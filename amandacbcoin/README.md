# AmandaCBCoin

Sistema de moeda virtual para o bot Amanda.

## Comandos Disponíveis

### 💰 Economia Básica
- `!daily` - Recebe uma recompensa diária de CBCoins
- `!work` ou `!trabalhar` - Trabalha para ganhar CBCoins
- `!rob` ou `!roubar` - Tenta roubar CBCoins de outro usuário
- `!pay` ou `!pagar` - Transfere CBCoins para outro usuário
- `!balance` ou `!saldo` - Verifica seu saldo de CBCoins
- `!ranking` ou `!top` - Mostra o ranking dos usuários mais ricos

### 🎮 Jogos e Apostas
- `!flip` ou `!coinflip` - Aposta cara ou coroa (valor)
- `!slots` - Joga caça-níquel (valor)
- `!duel` ou `!duelo` - Desafia outro usuário (valor)
- `!roulette` ou `!roleta` - Aposta na roleta (valor red/black/green)

### 🏪 Loja e Inventário
- `!shop` ou `!loja` - Mostra os itens disponíveis na loja
- `!buy` ou `!comprar` - Compra um item da loja (ID_DO_ITEM)
- `!sell` ou `!vender` - Vende um item do inventário (ID_DO_ITEM QUANTIDADE)
- `!inventory` ou `!inv` - Mostra seu inventário

### 📊 Perfil e Níveis
- `!profile` ou `!perfil` - Mostra seu perfil completo
- `!levels` ou `!niveis` - Mostra o ranking de níveis

## Sistema de Níveis

O sistema de níveis permite que você progrida e desbloqueie novas funcionalidades:

- Nível 2: Desbloqueia jogos de apostas
- Nível 3: Desbloqueia trabalho de pescador
- Nível 5: Melhora a habilidade de roubo
- Nível 7: Desbloqueia novos trabalhos
- Nível 10: Desbloqueia status VIP
- Nível 15: Ganha multiplicador permanente
- Nível 20: Recebe título de veterano

## Itens da Loja

- 🎣 Vara de Pescar: Aumenta ganhos na pesca
- 🍀 Amuleto da Sorte: Aumenta chances de roubo
- ⭐ Boost de XP: Dobra o XP ganho
- 👑 Badge VIP: Mostra seu status VIP

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do projeto
- Adicione a URL do MongoDB:
```
MONGODB_URI=sua_url_do_mongodb
```

3. Compile o projeto:
```bash
npm run build
```

4. Inicie o sistema:
```bash
npm start
```

## Desenvolvimento

Para desenvolvimento, você pode usar:
```bash
npm run dev
```

Para verificar a conexão com o banco de dados:
```bash
npm run check-db
```

## Estrutura do Projeto

```
amandacbcoin/
├── src/
│   ├── types/
│   │   └── User.ts
│   ├── database/
│   │   └── Database.ts
│   ├── shop/
│   │   └── ShopManager.ts
│   ├── games/
│   │   └── GamesManager.ts
│   ├── levels/
│   │   └── LevelManager.ts
│   └── CBCoinSystem.ts
├── config.ts
└── index.ts
```

## Licença

Este projeto é privado e de uso exclusivo do bot Amanda. 
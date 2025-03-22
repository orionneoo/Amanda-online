import { CommandResponse } from '../../amandacbcoin/src';

export function showMenu(): CommandResponse {
    return {
        text: `*🤖 MENU DE COMANDOS*

*📝 Comandos Básicos*
!menu - Mostra este menu
!menucomandos - Lista de comandos gerais
!menucbcoin - Sistema de moeda virtual
!ping - Verifica se estou online
!info - Informações do bot

*👥 Comandos de Grupo*
!grupo - Informações do grupo
!abrir - Abre o grupo
!fechar - Fecha o grupo
!nome (texto) - Altera nome do grupo
!desc (texto) - Altera descrição
!verdesc - Mostra descrição
!tagall - Marca todos os membros

*👑 Comandos de Administração*
!ban - Bane um membro (marque)
!kick - Bane um membro (marque)
!bio - Define sua biografia
!verbio - Vê sua biografia

*👩‍💼 Comandos de Anfitriã*
!anfitria.criar (texto) - Define texto
!anfitria.ver - Mostra texto atual
!anfitria.apagar - Remove texto
!reset - Apaga configurações

*💡 Dicas*
- Use !help (comando) para mais detalhes
- Alguns comandos só funcionam em grupos
- Alguns comandos requerem admin`,
        mentions: []
    };
}

export function showMenuComandos(): CommandResponse {
    return {
        text: `
╭━━━━━━━━━━━━━━━━╮
┃ 📜 *COMANDOS* 📜
╰━━━━━━━━━━━━━━━━╯

*COMANDOS GERAIS*
┠⊷ !ping
┃ ⤷ Verifica se o bot está online
┠⊷ !info
┃ ⤷ Mostra informações do bot
┠⊷ !menu
┃ ⤷ Mostra o menu principal

*COMANDOS DE GRUPO*
┠⊷ !grupo
┃ ⤷ Mostra informações do grupo
┠⊷ !abrir
┃ ⤷ Permite mensagens de todos
┠⊷ !fechar
┃ ⤷ Só admins podem enviar
┠⊷ !nome (texto)
┃ ⤷ Altera o nome do grupo
┠⊷ !desc (texto)
┃ ⤷ Altera a descrição
┠⊷ !verdesc
┃ ⤷ Mostra a descrição atual
┠⊷ !tagall
┃ ⤷ Marca todos os membros

*COMANDOS DE ADMIN*
┠⊷ !ban ou !kick
┃ ⤷ Bane um membro (marque)
┠⊷ !bio
┃ ⤷ Define sua biografia
┠⊷ !verbio
┃ ⤷ Vê biografia de alguém

©️ Amanda Bot 2024
`,
        mentions: []
    };
}

export function showMenuCBCoin(): CommandResponse {
    return {
        text: `
╭━━━━━━━━━━━━━━━━╮
┃ 💰 *CBCOIN* 💰
╰━━━━━━━━━━━━━━━━╯

*ADMINISTRAÇÃO*
┠⊷ !abrircbcoin
┃ ⤷ Ativa o CBCoin no grupo
┠⊷ !fecharcbcoin
┃ ⤷ Desativa o CBCoin no grupo

*ECONOMIA BÁSICA*
┠⊷ !daily ou !diario
┃ ⤷ Recompensa diária
┠⊷ !work ou !trabalhar
┃ ⤷ Trabalha para ganhar CBCoins
┠⊷ !balance ou !saldo
┃ ⤷ Verifica seu saldo
┠⊷ !top ou !ranking
┃ ⤷ Ranking dos mais ricos

*AGRICULTURA* 🌱
┠⊷ !plantar <semente>
┃ ⤷ Planta uma semente
┠⊷ !colher
┃ ⤷ Colhe sua plantação
┠⊷ Sementes disponíveis:
┃  🥕 Cenoura (Nível 1, 100 CBCoins)
┃  🍅 Tomate (Nível 5, 250 CBCoins)
┃  🍍 Abacaxi (Nível 10, 500 CBCoins)

*PESCA E MINERAÇÃO*
┠⊷ !fish ou !pescar
┃ ⤷ Pesca para ganhar CBCoins
┠⊷ !mine ou !minerar
┃ ⤷ Minera para ganhar CBCoins

*JOGOS E APOSTAS*
┠⊷ !flip <cara/coroa> <valor>
┃ ⤷ Aposta cara ou coroa
┠⊷ !slots <valor>
┃ ⤷ Joga caça-níqueis

*INVENTÁRIO E LOJA*
┠⊷ !shop ou !loja
┃ ⤷ Mostra itens à venda
┠⊷ !buy ou !comprar
┃ ⤷ Compra um item
┠⊷ !inventory ou !inv
┃ ⤷ Mostra seu inventário
┠⊷ !use ou !usar
┃ ⤷ Usa um item

*TRANSFERÊNCIAS*
┠⊷ !pay ou !transferir
┃ ⤷ Transfere CBCoins
┠⊷ !banco
┃ ⤷ Status do banco

©️ CBCoin 2024`,
        mentions: []
    };
}

export function showMenuAgricultura(): CommandResponse {
    return {
        text: `
╭━━━━━━━━━━━━━━━━╮
┃ 🌱 *AGRICULTURA* 🌱
╰━━━━━━━━━━━━━━━━╯

*COMO FUNCIONA*
A agricultura é uma forma de ganhar CBCoins e XP cultivando diferentes tipos de plantas.

*COMANDOS*
┠⊷ !plantar <semente>
┃ ⤷ Planta uma semente no seu terreno
┠⊷ !colher
┃ ⤷ Colhe sua plantação quando estiver pronta

*SEMENTES DISPONÍVEIS*
┠⊷ 🥕 Cenoura
┃ ⤷ Nível 1
┃ ⤷ Preço: 100 CBCoins
┃ ⤷ Tempo: 5 minutos
┃ ⤷ Lucro: 200 CBCoins + 50 XP

┠⊷ 🍅 Tomate
┃ ⤷ Nível 5
┃ ⤷ Preço: 250 CBCoins
┃ ⤷ Tempo: 10 minutos
┃ ⤷ Lucro: 500 CBCoins + 100 XP

┠⊷ 🍍 Abacaxi
┃ ⤷ Nível 10
┃ ⤷ Preço: 500 CBCoins
┃ ⤷ Tempo: 20 minutos
┃ ⤷ Lucro: 1000 CBCoins + 200 XP

*DICAS*
┠⊷ Cada planta tem seu tempo de crescimento
┠⊷ Colha antes que a plantação apodreça
┠⊷ Quanto mais rápido colher, maior o bônus
┠⊷ Você só pode ter uma plantação por vez
┠⊷ Use !plantar <semente> para começar

©️ CBCoin Farming 2024`,
        mentions: []
    };
}

export function showMenuAmanda(): CommandResponse {
    try {
        console.log('Gerando menu Amanda...');
        return {
            text: `
╭━━━━━━━━━━━━━━━━╮
┃ 🤖 *AMANDA* 🤖
╰━━━━━━━━━━━━━━━━╯

🧠 *SOBRE A AMANDA*
A Amanda é uma assistente virtual
alimentada por IA Gemini Pro da
Google, capaz de:

📚 *RECURSOS*
┠⊷ Responder perguntas
┠⊷ Auxiliar em tarefas
┠⊷ Criar conteúdo
┠⊷ Analisar imagens
┠⊷ Conversar naturalmente
┠⊷ Aprender com interações

💡 *COMO USAR*
Basta enviar uma mensagem normal
(sem comandos) e a Amanda irá
responder usando a IA Gemini.

⚙️ *MENUS DISPONÍVEIS*
┠⊷ !menu
┃    _Mostra este menu principal_
┠⊷ !menucomandos
┃    _Comandos administrativos_
┠⊷ !menucbcoin
┃    _Sistema de moeda virtual_

╭━━━━━━━━━━━━━━━━╮
┃ 👨‍💻 *INFORMAÇÕES* 👨‍💻
┠⊷ Criador: W
┠⊷ Contato: (21)967233931
┃
┃ ©️ Amanda Bot 2024
╰━━━━━━━━━━━━━━━━╯`,
            mentions: []
        };
    } catch (error) {
        console.error('Erro ao gerar menu Amanda:', error);
        return {
            text: '❌ Erro ao gerar menu. Por favor, tente novamente.',
            mentions: []
        };
    }
}

export function showMenuLevel(): CommandResponse {
    return {
        text: `
╭━━━━━━━━━━━━━━━━╮
┃ 📊 *NÍVEIS E HABILIDADES* 📊
╰━━━━━━━━━━━━━━━━╯

*HABILIDADES DISPONÍVEIS*
┠⊷ 🌾 Agricultura
┃ ⤷ Cultive e colha recursos
┠⊷ 🎣 Pesca
┃ ⤷ Pesque peixes e itens raros
┠⊷ 🎲 Apostas
┃ ⤷ Jogos e apostas especiais
┠⊷ 💹 Comércio
┃ ⤷ Compra e venda com lucro

*DESBLOQUEIOS POR NÍVEL*
┠⊷ Nível 2
┃ ⤷ 🎲 Sistema de apostas básico
┃ ⤷ 🌾 Agricultura básica
┠⊷ Nível 3
┃ ⤷ 🎣 Sistema de pesca
┃ ⤷ 💹 Comércio básico
┠⊷ Nível 5
┃ ⤷ 🎲 Apostas avançadas
┃ ⤷ 🌾 Plantações especiais
┠⊷ Nível 7
┃ ⤷ 🎣 Pesca em alto mar
┃ ⤷ 💹 Negociações lucrativas
┠⊷ Nível 10
┃ ⤷ 👑 Status VIP
┃ ⤷ 🌟 Todas habilidades melhoradas
┠⊷ Nível 15
┃ ⤷ 🔮 Multiplicador permanente
┃ ⤷ ✨ Itens exclusivos na loja
┠⊷ Nível 20
┃ ⤷ 🏆 Título de Mestre
┃ ⤷ 💎 Bônus em todas atividades

*COMANDOS DE HABILIDADES*
┠⊷ !plantar (nv.2+)
┃ ⤷ Inicia uma plantação
┠⊷ !colher (nv.2+)
┃ ⤷ Colhe plantações maduras
┠⊷ !pescar (nv.3+)
┃ ⤷ Inicia uma pescaria
┠⊷ !vender (nv.3+)
┃ ⤷ Negocia itens no mercado
┠⊷ !apostar (nv.2+)
┃ ⤷ Acessa jogos de azar

💡 *DICAS*
• Suba de nível para desbloquear mais
• Cada habilidade tem bônus únicos
• Combine atividades para mais lucro
• Itens da loja melhoram habilidades

©️ Amanda Bot 2024`,
        mentions: []
    };
} 
import { CommandResponse } from '../../amandacbcoin/src';

export function showMenu(): CommandResponse {
    return {
        text: `*🤖 MENU DE COMANDOS*

*📝 Comandos Básicos*
!menu - Mostra este menu
!menucomandos - Lista de comandos gerais
!menucbcoin - Sistema de moeda virtual
!menuagricultura - Sistema de agricultura
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
┠⊷ !plantacao
┃ ⤷ Mostra o status da sua plantação atual

*SEMENTES DISPONÍVEIS*
┠⊷ 🥕 Cenoura
┃ ⤷ ID: semente_cenoura
┃ ⤷ Nível 1
┃ ⤷ Preço: 100 CBCoins
┃ ⤷ Tempo: 5 minutos
┃ ⤷ Lucro: 200 CBCoins + 50 XP

┠⊷ 🍅 Tomate
┃ ⤷ ID: semente_tomate
┃ ⤷ Nível 5
┃ ⤷ Preço: 250 CBCoins
┃ ⤷ Tempo: 10 minutos
┃ ⤷ Lucro: 500 CBCoins + 100 XP

┠⊷ 🍍 Abacaxi
┃ ⤷ ID: semente_abacaxi
┃ ⤷ Nível 10
┃ ⤷ Preço: 500 CBCoins
┃ ⤷ Tempo: 20 minutos
┃ ⤷ Lucro: 1000 CBCoins + 200 XP

*DICAS*
┠⊷ Use !plantar semente_cenoura para plantar cenoura
┠⊷ Use !plantar semente_tomate para plantar tomate
┠⊷ Use !plantar semente_abacaxi para plantar abacaxi
┠⊷ Use !plantacao para ver o status da sua plantação
┠⊷ Cada planta tem seu tempo de crescimento
┠⊷ Colha antes que a plantação apodreça
┠⊷ Quanto mais rápido colher, maior o bônus
┠⊷ Você só pode ter uma plantação por vez

©️ CBCoin Farming 2024`,
        mentions: []
    };
}
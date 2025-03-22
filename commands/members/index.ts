import { WASocket, WAMessage } from "@whiskeysockets/baileys";
import { CommandResponse } from '../../amandacbcoin/src';
import { showMenu, showMenuComandos, showMenuCBCoin, showMenuAmanda, showMenuLevel } from '../admin/menu';
import { CONFIG, BOT_NUMBER } from '../../config';
import { cbcoinCommands } from './cbcoin';

// Função para verificar se o bot está online
function ping(): CommandResponse {
    const emojis = ['🏓', '⚡', '🎯', '🌟', '✨'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    return {
        text: `${randomEmoji} *pong!* ${randomEmoji}\n⏱️ Latência: *super rápida!* 🚀`,
        mentions: []
    };
}

// Função para mostrar informações do bot
function info(): CommandResponse {
    return {
        text: `
╭━━━━━━━━━━━━━━━━╮
┃ 🤖 *AMANDA BOT* 🤖
╰━━━━━━━━━━━━━━━━╯

📱 *Informações do Bot*
┠⊷ Nome: Amanda
┠⊷ Versão: 3.031
┠⊷ Número: ${BOT_NUMBER}
┠⊷ Prefixo: !
┠⊷ Status: Online

👨‍💻 *Desenvolvedor*
┠⊷ Nome: W
┠⊷ Contato: (21)967233931

©️ Amanda Bot 2024
`,
        mentions: []
    };
}

// Lista de comandos do CBCoin
const CBCOIN_COMMANDS = [
    'daily', 'work', 'mine', 'rob', 'balance', 'profile', 
    'top', 'inventory', 'shop', 'buy', 'use', 'flip', 'slots',
    'diario', 'trabalhar', 'minerar', 'roubar', 'saldo', 'perfil',
    'ranking', 'inventario', 'loja', 'comprar', 'usar', 'apostar',
    'cacaniqueis', 'transferir', 'abrircbcoin', 'fecharcbcoin',
    'banco', 'bancocbcoin', 'pescar', 'fish', 'plantar', 'colher'
];

// Função principal para processar comandos de membros
export async function handleMemberCommand(msg: WAMessage, command: string, socket: WASocket): Promise<CommandResponse> {
    try {
        console.log('Iniciando processamento do comando:', command);
        const parts = command.toLowerCase().trim().split(' ');
        const cmd = parts[0];

        // Primeiro, processa comandos básicos
        switch (cmd) {
            case '!menu':
                console.log('Executando comando menu principal');
                return showMenu();

            case '!menucomandos':
                console.log('Executando comando menu de comandos');
                return showMenuComandos();

            case '!menucbcoin':
                console.log('Executando comando menu CBCoin');
                return showMenuCBCoin();

            case '!menuamanda':
                console.log('Executando comando menu Amanda');
                return showMenuAmanda();

            case '!menulevel':
                console.log('Executando comando menu de níveis');
                return showMenuLevel();

            case '!ping':
                console.log('Executando comando ping');
                return ping();

            case '!info':
                console.log('Executando comando info');
                return info();
        }

        // Se não for comando básico, verifica se é comando CBCoin
        const cbCommand = cmd.replace('!', '');
        if (CBCOIN_COMMANDS.includes(cbCommand)) {
            console.log('Processando comando CBCoin:', command);
            // Atualiza a mensagem com o comando completo
            const updatedMsg = {
                ...msg,
                message: {
                    ...msg.message,
                    conversation: command
                }
            };
            return await cbcoinCommands.handleCommand(updatedMsg);
        }

        // Se chegou aqui, comando não foi reconhecido
        console.log('Comando não reconhecido:', cmd);
        return {
            text: '❌ Comando não reconhecido.',
            mentions: []
        };
    } catch (error) {
        console.error('Erro ao processar comando:', error);
        return {
            text: '❌ Erro ao processar comando. Por favor, tente novamente.',
            mentions: []
        };
    }
} 
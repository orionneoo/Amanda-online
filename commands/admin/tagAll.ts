import { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { CommandResponse } from '../../amandacbcoin/src';

export async function tagAll(msg: WAMessage, socket: WASocket): Promise<CommandResponse> {
    try {
        console.log('Executando comando tagAll...');
        const groupMetadata = await socket.groupMetadata(msg.key.remoteJid);
        console.log('Metadados do grupo obtidos:', groupMetadata.subject);
        
        const mentions = groupMetadata.participants.map(p => p.id);
        console.log(`Marcando ${mentions.length} membros`);
        
        // Gera um número aleatório entre 1 e 5 para variar a mensagem
        const randomNum = Math.floor(Math.random() * 5) + 1;
        let text = '';
        
        switch(randomNum) {
            case 1:
                text = `━━━━━━━━━━━━━━━━━━
👥 *ATENÇÃO MEMBROS!*
━━━━━━━━━━━━━━━━━━\n\n`;
                break;
            case 2:
                text = `╔══✪〘 🌟 CHAMADA 🌟 〙✪══
║
╠══✪〘 ATENÇÃO! 〙✪══\n\n`;
                break;
            case 3:
                text = `⚠️ *NOTIFICAÇÃO GERAL* ⚠️

🔔 *Atenção pessoal do grupo:*
━━━━━━━━━━━━━━━━━━\n\n`;
                break;
            case 4:
                text = `🌸 *Oiee pessoal!* 🌺

💝 A Amanda está chamando todo mundo!
🎀 Não me ignorem, viu? 😊\n\n`;
                break;
            default:
                text = `┏━━━「 📢 AVISO 📢 」━━━┓
┃
┗━━━「 ATENÇÃO TODOS 」━━━┛\n\n`;
        }

        // Adiciona os membros de forma mais organizada
        const membersList = groupMetadata.participants.map(participant => {
            const number = participant.id.split('@')[0];
            // Adiciona um emoji aleatório antes de cada número
            const emojis = ['👤', '👥', '🗣️', '👻', '🎭', '👾', '🤖', '👋', '💫', '✨'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            return `${randomEmoji} @${number}`;
        });

        text += membersList.join('\n');
        
        // Adiciona um rodapé
        text += '\n\n━━━━━━━━━━━━━━━━━━';
        
        console.log('Mensagem preparada:', text);
        
        return {
            text: text,
            mentions: mentions
        };
    } catch (error) {
        console.error('Erro ao marcar todos:', error);
        return {
            text: '❌ Erro ao marcar membros do grupo.',
            mentions: []
        };
    }
} 
import { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { PREFIX, BOT_NUMBER } from '../../config';
import { CommandResponse } from '../../amandacbcoin/src';

// Classes de erro personalizadas
class DangerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DangerError';
    }
}

class InvalidParameterError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidParameterError';
    }
}

// Funções utilitárias
const onlyNumbers = (str: string): string => str.replace(/[^0-9]/g, '');

const toUserJid = (number: string): string => {
    const cleanNumber = onlyNumbers(number);
    return `${cleanNumber}@s.whatsapp.net`;
};

// Informações do comando
export const banCommand = {
    name: "banir",
    description: "Removo um membro do grupo",
    commands: ["ban", "kick"],
    usage: `${PREFIX}ban @marcar_membro 

ou 

${PREFIX}ban (mencionando uma mensagem)`,
};

export async function banMember(msg: WAMessage, socket: WASocket): Promise<CommandResponse> {
    try {
        const remoteJid = msg.key.remoteJid;
        const userJid = msg.key.participant || msg.key.remoteJid;

        // Obtém os argumentos e menções
        const text = msg.message?.conversation || 
            msg.message?.extendedTextMessage?.text || 
            '';
        const args = text.split(' ').slice(1);
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const isReply = !!msg.message?.extendedTextMessage?.contextInfo?.participant;
        const replyJid = msg.message?.extendedTextMessage?.contextInfo?.participant;

        // Verifica se é administrador
        const groupMetadata = await socket.groupMetadata(remoteJid);
        const isAdmin = groupMetadata.participants.some(p => 
            p.id === userJid && (p.admin === 'admin' || p.admin === 'superadmin')
        );
        
        if (!isAdmin) {
            return {
                text: 'Você não tem permissão para usar este comando!',
                mentions: []
            };
        }

        // Verifica se foi fornecido um membro para banir
        if (!mentions.length && !args.length && !isReply) {
            return {
                text: 'Você precisa mencionar (@), marcar alguém ou responder a mensagem de quem deseja remover!',
                mentions: []
            };
        }

        // Obtém o JID do membro a ser removido
        let memberToRemoveJid: string;
        
        if (isReply) {
            // Se for reply, usa o JID da mensagem respondida
            memberToRemoveJid = replyJid;
            console.log('Usando JID da mensagem respondida:', memberToRemoveJid);
        } else if (mentions.length > 0) {
            // Se houver menções (@), usa a primeira menção
            memberToRemoveJid = mentions[0];
            console.log('Usando JID da menção:', memberToRemoveJid);
        } else if (args.length > 0) {
            // Se for número direto, converte para JID
            memberToRemoveJid = toUserJid(args[0]);
            console.log('Usando JID do número fornecido:', memberToRemoveJid);
        } else {
            return {
                text: 'Não foi possível identificar quem você deseja remover!',
                mentions: []
            };
        }

        // Verifica se está tentando banir a si mesmo
        if (memberToRemoveJid === userJid) {
            return {
                text: 'Você não pode remover você mesmo!',
                mentions: []
            };
        }

        // Verifica se está tentando banir o bot
        if (memberToRemoveJid === socket.user.id) {
            return {
                text: 'Você não pode me remover!',
                mentions: []
            };
        }

        // Verifica se o membro está no grupo
        const isMember = groupMetadata.participants.some(p => p.id === memberToRemoveJid);
        if (!isMember) {
            return {
                text: 'Este usuário não está no grupo!',
                mentions: []
            };
        }

        // Remove o membro
        await socket.groupParticipantsUpdate(
            remoteJid,
            [memberToRemoveJid],
            "remove"
        );

        // Envia reação de sucesso (emoji)
        try {
            await socket.sendMessage(remoteJid, { 
                react: { 
                    text: "✅", 
                    key: msg.key 
                } 
            });
        } catch (error) {
            console.error('Erro ao enviar reação:', error);
        }

        return {
            text: '✅ Membro removido com sucesso!',
            mentions: []
        };
    } catch (error) {
        console.error('Erro ao banir membro:', error);
        return {
            text: '❌ Erro ao tentar remover o membro. Verifique se tenho permissão de administrador.',
            mentions: []
        };
    }
} 
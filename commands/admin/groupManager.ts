import { WASocket, WAMessage, GroupMetadata } from '@whiskeysockets/baileys';
import { CommandResponse } from '../../amandacbcoin/src';

export class GroupManager {
    constructor(private socket: WASocket) {}

    async openGroup(msg: WAMessage): Promise<CommandResponse> {
        try {
            const groupId = msg.key.remoteJid;
            await this.socket.groupSettingUpdate(groupId, 'not_announcement');
            return {
                text: '✅ Grupo aberto com sucesso! Agora todos podem enviar mensagens.',
                mentions: []
            };
        } catch (error) {
            console.error('Erro ao abrir grupo:', error);
            return {
                text: '❌ Erro ao abrir o grupo. Verifique se sou administradora.',
                mentions: []
            };
        }
    }

    async closeGroup(msg: WAMessage): Promise<CommandResponse> {
        try {
            const groupId = msg.key.remoteJid;
            await this.socket.groupSettingUpdate(groupId, 'announcement');
            return {
                text: '✅ Grupo fechado com sucesso! Agora apenas administradores podem enviar mensagens.',
                mentions: []
            };
        } catch (error) {
            console.error('Erro ao fechar grupo:', error);
            return {
                text: '❌ Erro ao fechar o grupo. Verifique se sou administradora.',
                mentions: []
            };
        }
    }

    async setGroupName(msg: WAMessage, newName: string): Promise<CommandResponse> {
        try {
            const groupId = msg.key.remoteJid;
            await this.socket.groupUpdateSubject(groupId, newName);
            return {
                text: `✅ Nome do grupo alterado para: ${newName}`,
                mentions: []
            };
        } catch (error) {
            console.error('Erro ao alterar nome do grupo:', error);
            return {
                text: '❌ Erro ao alterar o nome do grupo. Verifique se sou administradora.',
                mentions: []
            };
        }
    }

    async setGroupDescription(msg: WAMessage, newDesc: string): Promise<CommandResponse> {
        try {
            const groupId = msg.key.remoteJid;
            await this.socket.groupUpdateDescription(groupId, newDesc);
            return {
                text: '✅ Descrição do grupo atualizada com sucesso!',
                mentions: []
            };
        } catch (error) {
            console.error('Erro ao alterar descrição do grupo:', error);
            return {
                text: '❌ Erro ao alterar a descrição do grupo. Verifique se sou administradora.',
                mentions: []
            };
        }
    }

    async getGroupDescription(msg: WAMessage): Promise<CommandResponse> {
        try {
            const groupId = msg.key.remoteJid;
            const groupInfo = await this.socket.groupMetadata(groupId);
            return {
                text: `📝 *Descrição do Grupo*\n\n${groupInfo.desc || 'Sem descrição.'}`,
                mentions: []
            };
        } catch (error) {
            console.error('Erro ao obter descrição do grupo:', error);
            return {
                text: '❌ Erro ao obter a descrição do grupo.',
                mentions: []
            };
        }
    }

    async searchGoogle(query: string): Promise<CommandResponse> {
        try {
            // Aqui você pode implementar a busca usando a API do Google
            // Por enquanto, retornaremos uma mensagem informativa
            return {
                text: '🔍 Esta funcionalidade será implementada em breve.',
                mentions: []
            };
        } catch (error) {
            console.error('Erro na pesquisa:', error);
            return {
                text: '❌ Erro ao realizar a pesquisa.',
                mentions: []
            };
        }
    }

    async getGroupInfo(msg: WAMessage): Promise<CommandResponse> {
        try {
            const groupId = msg.key.remoteJid;
            const groupInfo: GroupMetadata = await this.socket.groupMetadata(groupId);
            
            const adminList = groupInfo.participants
                .filter(p => p.admin)
                .map(p => `@${p.id.split('@')[0]}`);

            const mentions = groupInfo.participants
                .filter(p => p.admin)
                .map(p => p.id);

            const info = `🏷️ *Informações do Grupo*

📝 *Nome:* ${groupInfo.subject}
👥 *Participantes:* ${groupInfo.participants.length}
👑 *Criador:* @${groupInfo.owner?.split('@')[0]}
📅 *Criado em:* ${new Date(groupInfo.creation * 1000).toLocaleDateString()}

👮‍♂️ *Administradores:*
${adminList.join('\n')}

📝 *Descrição:*
${groupInfo.desc || 'Sem descrição.'}`;

            return {
                text: info,
                mentions: mentions
            };
        } catch (error) {
            console.error('Erro ao obter informações do grupo:', error);
            return {
                text: '❌ Erro ao obter informações do grupo.',
                mentions: []
            };
        }
    }
} 
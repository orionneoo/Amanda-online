import { WASocket, WAMessage } from "@whiskeysockets/baileys";
import { CommandResponse } from '../../amandacbcoin/src';
import { showMenu, showMenuAgricultura } from './menu_updated';
import { tagAll } from './tagAll';
import { banMember } from './ban';
import { handleAnfitriaCommand } from './anfitria';
import handleBioCommand from './bio';
import { GroupManager } from './groupManager';

// Constante para o número do dono do bot
const BOT_OWNER = "5521967233931@s.whatsapp.net";

// Função principal para processar comandos administrativos
export async function handleAdminCommand(msg: WAMessage, command: string, socket: WASocket): Promise<CommandResponse | null> {
    try {
        console.log('Iniciando processamento do comando administrativo:', command);
        const parts = command.toLowerCase().trim().split(' ');
        const cmd = parts[0];
        const args = parts.slice(1).join(' ');

        // Instancia o gerenciador de grupo
        const groupManager = new GroupManager(socket);

        // Comandos de anfitriã
        if (cmd.startsWith('!anfitria.')) {
            return await handleAnfitriaCommand(msg, command, socket);
        }

        // Outros comandos administrativos
        switch (cmd) {
            case '!menu':
                return showMenu();

            case '!menuagricultura':
                return showMenuAgricultura();

            case '!tagall':
                return await tagAll(msg, socket);

            case '!ban':
            case '!kick':
                return await banMember(msg, socket);

            case '!bio':
            case '!verbio':
                await handleBioCommand(msg, socket);
                return null;

            // Comandos de grupo
            case '!grupo':
                return await groupManager.getGroupInfo(msg);

            case '!abrir':
                return await groupManager.openGroup(msg);

            case '!fechar':
                return await groupManager.closeGroup(msg);

            case '!nome':
                if (!args) return { text: '❌ Digite o novo nome após o comando.', mentions: [] };
                return await groupManager.setGroupName(msg, args);

            case '!desc':
                if (!args) return { text: '❌ Digite a nova descrição após o comando.', mentions: [] };
                return await groupManager.setGroupDescription(msg, args);

            case '!verdesc':
                return await groupManager.getGroupDescription(msg);

            default:
                console.log('Comando não reconhecido:', cmd);
                return null;
        }
    } catch (error) {
        console.error('Erro ao processar comando administrativo:', error);
        return {
            text: '❌ Erro ao processar comando. Por favor, tente novamente.',
            mentions: []
        };
    }
} 
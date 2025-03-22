// Interface para configuração
export interface Config {
    BOT_NAME: string;
    VERSION: string;
    RATE_LIMIT: {
        MAX_MESSAGES: number;
        TIME_WINDOW: number;
        RATE_LIMIT_DELAY: number;
    };
}

// Configurações gerais
export const CONFIG = {
    BOT_NAME: 'Amanda',
    VERSION: '3.031',
    RATE_LIMIT: {
        MAX_MESSAGES: 30,
        TIME_WINDOW: 60000,
        RATE_LIMIT_DELAY: 5000
    }
} as const as Config;

// Prefixo para comandos
export const PREFIX = '!';

// Número do bot
export const BOT_NUMBER = '5521964744746';

// Interface para os dados da mensagem
export interface MessageData {
    text: string;
    isMention: boolean;
    isReply: boolean;
    sender: {
        name: string;
        id: string;
    };
    group?: {
        id: string;
    };
    timestamp: Date;
}

// Função para verificar se a Amanda foi acionada
export function isAmandaActivated(message: MessageData): boolean {
    const text = message.text.toLowerCase();
    
    // Ignora se for apenas o prefixo !
    if (text === PREFIX || text === PREFIX + ' ') {
        return false;
    }
    
    const hasPrefix = text.startsWith(PREFIX);
    const hasAmandaName = text.includes('amanda');
    const hasAmandinhaName = text.includes('amandinha');
    
    const isActivated = (
        hasPrefix ||           // Comando com prefixo
        hasAmandaName ||      // Menciona Amanda
        hasAmandinhaName ||   // Menciona Amandinha
        message.isMention ||  // Menção direta
        (message.isReply)     // Resposta a uma mensagem da Amanda
    );

    // Se o bot foi ativado, retorna true, caso contrário, false
    return isActivated;
}

// Função para formatar a mensagem de ativação
export function formatActivationMessage(data: MessageData): string {
    const date = data.timestamp;
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR');
    
    return `📱 AMANDA ACIONADA
📅 Data: ${formattedDate}
⏰ Hora: ${formattedTime}
👤 Nome: ${data.sender.name}
🆔 ID: ${data.sender.id}
${data.group ? `👥 Grupo: ${data.group.id}\n` : ''}📄 Arquivo: sys_inst.${data.group?.id || data.sender.id}.config
💬 Mensagem: ${data.text}`;
} 
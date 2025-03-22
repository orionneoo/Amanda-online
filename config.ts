export interface MessageData {
    text: string;
    isMention: boolean;
    isReply: boolean;
    sender: {
        name: string;
        id: string;
    };
    timestamp: Date;
    group?: {
        id: string;
    };
    message?: string;
    user_name?: string;
}

export const PREFIX = '!';
export const BOT_NUMBER = '5521964744746';

export const CONFIG = {
    RATE_LIMIT: {
        MAX_MESSAGES: 10,
        TIME_WINDOW: 60000,
        RATE_LIMIT_DELAY: 30000
    }
};

export function isAmandaActivated(messageData: MessageData): boolean {
    return (
        messageData.text.toLowerCase().includes('amanda') ||
        messageData.text.toLowerCase().includes('amandinha') ||
        messageData.isReply ||
        messageData.isMention
    );
}

export function formatActivationMessage(messageData: MessageData): string {
    const now = new Date();
    const isGroup = messageData.group !== undefined;
    
    return `
📱 AMANDA ACIONADA
📅 Data: ${now.toLocaleDateString()}
⏰ Hora: ${now.toLocaleTimeString()}
👤 Nome: ${messageData.sender.name}
🆔 ID: ${messageData.sender.id}
${isGroup ? `👥 Grupo: ${messageData.group.id}` : ''}
💬 Mensagem: ${messageData.text}
`;
} 
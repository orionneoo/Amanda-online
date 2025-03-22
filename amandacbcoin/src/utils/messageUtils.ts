import { WAMessage } from '@whiskeysockets/baileys';

export function extractMessageContent(message: WAMessage): string | null {
    return message.message?.conversation || 
           message.message?.extendedTextMessage?.text || 
           message.message?.imageMessage?.caption || 
           null;
}

export function extractUserName(message: WAMessage): string {
    return message.pushName || 'Usuário';
} 
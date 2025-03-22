import fs from 'fs';
import path from 'path';
import { Boom } from '@hapi/boom';
import NodeCache from 'node-cache';
import makeWASocket, { AnyMessageContent, BinaryInfo, delay, DisconnectReason, encodeWAM, fetchLatestBaileysVersion, getAggregateVotesInPollMessage, makeCacheableSignalKeyStore, makeInMemoryStore, proto, useMultiFileAuthState, WAMessageContent, WAMessageKey, isJidGroup } from '@whiskeysockets/baileys';
import MAIN_LOGGER from '@whiskeysockets/baileys/lib/Utils/logger';
import PQueue from 'p-queue';
import AmandaBOT from './AmandaBOT';
import pino from 'pino';

// Sistema de logging melhorado
const logLevels = {
    INFO: '📝',
    ERROR: '❌',
    WARNING: '⚠️',
    SUCCESS: '✅',
    DEBUG: '🔍'
};

// Configuração do Pino logger
const logger = pino({
    level: 'error'
});

class FileLogger {
    private logFile: string;
    private errorFile: string;

    constructor() {
        const logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }

        this.logFile = path.join(logDir, 'amanda.log');
        this.errorFile = path.join(logDir, 'error.log');
    }

    private writeToFile(filePath: string, message: string): void {
        try {
            fs.appendFileSync(filePath, message + '\n');
        } catch (error) {
            console.error('Erro ao escrever no arquivo de log:', error);
        }
    }

    public log(level: keyof typeof logLevels, message: string, error?: any): void {
        const timestamp = new Date().toISOString();
        const logPrefix = `${logLevels[level]} [${timestamp}]`;
        const logMessage = `${logPrefix} ${message}`;

        const isAmandaMessage = message.toLowerCase().includes('amanda') && 
            !message.includes('senderKeyDistributionMessage') && 
            !message.includes('reactionMessage');
        
        const isReplyOrMention = message.includes('É Resposta: Sim') || 
            message.includes('Tem Menções: Sim');
        
        if (level === 'ERROR' || level === 'WARNING' || (isAmandaMessage || isReplyOrMention)) {
            console.log(logMessage);
            this.writeToFile(this.logFile, logMessage);

            if (error) {
                const errorDetails = {
                    message: error.message,
                    stack: error.stack,
                    code: error.code,
                    data: error.data
                };

                const errorMessage = `${logPrefix} Detalhes do erro: ${JSON.stringify(errorDetails, null, 2)}`;
                console.error(errorMessage);
                
                if (level === 'ERROR') {
                    this.writeToFile(this.errorFile, errorMessage);
                }
            }
        }
    }

    public debug(message: string): void {
        this.log('DEBUG', message);
    }

    public info(message: string): void {
        this.log('INFO', message);
    }

    public warning(message: string, error?: any): void {
        this.log('WARNING', message, error);
    }

    public error(message: string, error?: any): void {
        this.log('ERROR', message, error);
    }

    public success(message: string): void {
        this.log('SUCCESS', message);
    }
}

const fileLogger = new FileLogger();

const msgRetryCounterCache = new NodeCache();
const messageQueue = new PQueue({ concurrency: 5 });
let isOnline = false;

// Criando o store do Baileys
const store = makeInMemoryStore({});

// Função getMessage necessária para o Baileys
async function getMessage(key: WAMessageKey): Promise<WAMessageContent | undefined> {
    if (store) {
        const msg = await store.loadMessage(key.remoteJid!, key.id!);
        return msg?.message || undefined;
    }
    return proto.Message.fromObject({});
}

function generateLogMessage(msg, type) {
    const { remoteJid, fromMe, id } = msg.key;
    const isGroup = isJidGroup(remoteJid);
    const chatType = isGroup ? 'Grupo' : 'Privado';
    const chatName = isGroup ? (msg.chat?.name || remoteJid) : remoteJid;
    const sender = fromMe ? 'Você' : (msg.pushName || remoteJid);
    const messageContent = msg.message ? Object.keys(msg.message)[0] : 'Sem conteúdo';
    
    // Verifica se é uma resposta
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    const isReply = contextInfo?.participant ? 'Sim' : 'Não';
    const replyToId = contextInfo?.participant || 'N/A';
    
    // Verifica se tem menções
    const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const hasMentions = mentionedJids.length > 0 ? 'Sim' : 'Não';
    const mentionsList = mentionedJids.join(', ');

    return `${type} - ${new Date().toLocaleString()}
    Chat: ${chatType}: ${chatName}
    Remetente: ${sender}
    ID da Mensagem: ${id}
    Conteúdo: ${messageContent}
    É Resposta: ${isReply} (Para: ${replyToId})
    Tem Menções: ${hasMentions} (${mentionsList})`;
}

const startSock = async () => {
    try {
        const authFolder = 'baileys_auth_info';
        const { state, saveCreds } = await useMultiFileAuthState(authFolder).catch(err => {
            fileLogger.error('Erro ao carregar estado de autenticação:', err);
            throw err;
        });

        const { version, isLatest } = await fetchLatestBaileysVersion().catch(err => {
            fileLogger.error('Erro ao buscar versão do WhatsApp:', err);
            throw err;
        });

        fileLogger.info(`Usando WA v${version.join('.')}, versão mais recente: ${isLatest}`);

        const sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: true,
            browser: ["AmandaBOT", "Chrome", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/113.0.0.0 Safari/537.36"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            msgRetryCounterCache,
            generateHighQualityLinkPreview: true,
            getMessage,
        });

        store.bind(sock.ev);

        // Inicializa o AmandaBOT
        AmandaBOT.init(sock);

        // Configuração inicial de tratamento de erros global
        process.on('unhandledRejection', (reason, promise) => {
            fileLogger.error('Unhandled Promise Rejection:', reason);
            // Não deixa o processo morrer
        });

        process.on('uncaughtException', (err) => {
            fileLogger.error('Uncaught Exception:', err);
            // Não deixa o processo morrer
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                fileLogger.error(`Conexão fechada. Erro: ${JSON.stringify(lastDisconnect?.error)}`);
                if (shouldReconnect) {
                    fileLogger.info('Reconectando...');
                    startSock();
                } else {
                    fileLogger.info('WhatsApp desconectado...');
                }
            } else if (connection === 'open') {
                isOnline = true;
                fileLogger.success('WhatsApp conectado!');
            }
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type === 'notify' && isOnline) {
                for (const msg of messages) {
                    if (!msg.key.fromMe) {
                        messageQueue.add(async () => {
                            try {
                                await AmandaBOT.handle(msg);
                            } catch (error) {
                                fileLogger.error('Erro ao processar mensagem:', error);
                            }
                        });
                    }
                }
            }
        });

    } catch (error) {
        fileLogger.error('Erro ao iniciar socket:', error);
        // Tenta reconectar após 5 segundos
        setTimeout(startSock, 5000);
    }
};

startSock();

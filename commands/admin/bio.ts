import { WAMessage, WASocket, downloadMediaMessage } from '@whiskeysockets/baileys';
import { MongoClient, Collection } from 'mongodb';
import { config } from 'dotenv';

config();

interface UserBio {
    user_id: string;
    name: string;
    bio_text: string;
    photo_url: string;
    created_at: Date;
    updated_at: Date;
}

export class BioManager {
    private client: MongoClient;
    private bios: Collection<UserBio>;

    constructor() {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        this.client = new MongoClient(uri);
        this.connect();
    }

    private async connect() {
        try {
            await this.client.connect();
            console.log('📦 Conectado ao MongoDB Atlas com sucesso!');
            
            const db = this.client.db('AmandaeCBcoin');
            this.bios = db.collection('user_bios');
            
            // Criar índices necessários
            await this.createIndexes();
        } catch (error) {
            console.error('Erro ao conectar ao MongoDB:', error);
        }
    }

    private async createIndexes() {
        try {
            await this.bios.createIndex({ user_id: 1 }, { unique: true });
            console.log('✅ Índices criados/verificados com sucesso');
        } catch (error) {
            console.error('Erro ao criar índices:', error);
        }
    }

    public async setBio(msg: WAMessage, socket: WASocket): Promise<string> {
        try {
            console.log('Iniciando setBio...');
            // Verificar se a mensagem tem mídia e legenda
            if (!msg.message?.imageMessage) {
                return '❌ Por favor, envie uma foto com legenda usando !bio';
            }

            // Obter o texto da legenda
            const caption = msg.message.imageMessage.caption || '';
            const bioText = caption.replace('!bio', '').trim();
            console.log('Texto da bio:', bioText);
            
            if (!bioText) {
                return '❌ Por favor, adicione um texto na legenda da foto';
            }

            // Baixar a mídia
            console.log('Baixando mídia...');
            const mediaData = await downloadMediaMessage(msg, 'buffer', {});
            const mediaBase64 = Buffer.from(mediaData as Buffer).toString('base64');
            const mimeType = msg.message.imageMessage.mimetype;
            console.log('Mídia baixada com sucesso. MimeType:', mimeType);

            // Obter o ID do usuário mencionado ou o autor
            const userId = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.key.participant || msg.key.remoteJid;
            console.log('ID do usuário:', userId);
            
            // Obter o nome do usuário
            const groupMetadata = await socket.groupMetadata(msg.key.remoteJid);
            const participant = groupMetadata.participants.find(p => p.id === userId);
            const userName = participant?.notify || participant?.id.split('@')[0];
            console.log('Nome do usuário:', userName);

            const bioData: UserBio = {
                user_id: userId,
                name: userName,
                bio_text: bioText,
                photo_url: `data:${mimeType};base64,${mediaBase64}`,
                created_at: new Date(),
                updated_at: new Date()
            };

            console.log('Salvando bio no banco de dados...');
            await this.bios.updateOne(
                { user_id: userId },
                { $set: bioData },
                { upsert: true }
            );
            console.log('Bio salva com sucesso!');

            return `✅ Bio de @${userName} atualizada com sucesso!`;
        } catch (error) {
            console.error('Erro ao salvar bio:', error);
            return '❌ Ocorreu um erro ao salvar a bio';
        }
    }

    public async viewBio(msg: WAMessage, socket: WASocket): Promise<{ text: string; media?: Buffer; mimeType?: string }> {
        try {
            console.log('Iniciando viewBio...');
            const userId = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            console.log('ID do usuário mencionado:', userId);
            
            if (!userId) {
                return { text: '❌ Por favor, mencione um usuário para ver a bio' };
            }

            console.log('Buscando bio no banco de dados...');
            const bio = await this.bios.findOne({ user_id: userId });
            console.log('Bio encontrada:', bio ? 'Sim' : 'Não');
            
            if (!bio) {
                return { text: '❌ Este usuário ainda não tem uma bio' };
            }

            console.log('Processando dados da mídia...');
            const mediaData = Buffer.from(bio.photo_url.split(',')[1], 'base64');
            const mimeType = bio.photo_url.split(';')[0].split(':')[1];
            console.log('MimeType da mídia:', mimeType);

            const response = `👤 *BIO DE @${bio.name}*\n\n${bio.bio_text}`;
            console.log('Resposta preparada:', response);
            
            return { 
                text: response, 
                media: mediaData,
                mimeType: mimeType
            };
        } catch (error) {
            console.error('Erro ao buscar bio:', error);
            return { text: '❌ Ocorreu um erro ao buscar a bio' };
        }
    }
}

export default async function handleBioCommand(msg: WAMessage, socket: WASocket): Promise<void> {
    try {
        console.log('Iniciando handleBioCommand...');
        const bioManager = new BioManager();

        if (msg.message?.conversation?.startsWith('!bio') || msg.message?.imageMessage?.caption?.startsWith('!bio')) {
            console.log('Comando !bio detectado');
            const response = await bioManager.setBio(msg, socket);
            console.log('Enviando resposta do setBio:', response);
            await socket.sendMessage(msg.key.remoteJid, { 
                text: response,
                mentions: [msg.key.participant || msg.key.remoteJid]
            });
        } else if (msg.message?.conversation?.startsWith('!verbio')) {
            console.log('Comando !verbio detectado');
            const response = await bioManager.viewBio(msg, socket);
            console.log('Resposta do viewBio recebida');
            
            if (response.media && response.mimeType) {
                console.log('Enviando resposta com mídia...');
                await socket.sendMessage(msg.key.remoteJid, { 
                    image: response.media,
                    caption: response.text,
                    mentions: msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
                });
            } else {
                console.log('Enviando resposta sem mídia...');
                await socket.sendMessage(msg.key.remoteJid, { 
                    text: response.text,
                    mentions: msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
                });
            }
        }
        console.log('Comando processado com sucesso!');
    } catch (error) {
        console.error('Erro ao processar comando:', error);
        await socket.sendMessage(msg.key.remoteJid, { 
            text: '❌ Ocorreu um erro ao processar o comando'
        });
    }
} 
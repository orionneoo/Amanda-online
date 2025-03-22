import { WASocket, WAMessage } from '@whiskeysockets/baileys';
import { MongoClient, Collection } from 'mongodb';
import { CommandResponse } from '../../amandacbcoin/src';
import * as dotenv from 'dotenv';

dotenv.config();

export async function handleAnfitriaCommand(msg: WAMessage, command: string, socket: WASocket): Promise<CommandResponse> {
    try {
        const parts = command.toLowerCase().trim().split(' ');
        const cmd = parts[0];

        switch (cmd) {
            case '!anfitria.criar':
                const texto = command.slice(14).trim();
                return await criarAnfitria(msg, texto);

            case '!anfitria.ver':
                return await verAnfitria(msg);

            case '!anfitria.apagar':
                return await apagarAnfitria(msg);

            case '!reset':
                return await resetPersonBot(msg);

            default:
                return {
                    text: '❌ Comando de anfitriã inválido.',
                    mentions: []
                };
        }
    } catch (error) {
        console.error('Erro ao processar comando de anfitriã:', error);
        return {
            text: '❌ Erro ao processar comando. Por favor, tente novamente.',
            mentions: []
        };
    }
}

async function criarAnfitria(msg: WAMessage, texto: string): Promise<CommandResponse> {
    if (!texto) {
        return {
            text: '❌ Por favor, forneça o texto para configurar a anfitriã.',
            mentions: []
        };
    }

    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();

        const db = client.db('AmandaeCBcoin');
        const collection = db.collection('group_settings');

        const groupId = msg.key.remoteJid;
        const update = {
            $set: {
                welcome_message: texto,
                updated_at: new Date()
            },
            $setOnInsert: {
                group_id: groupId,
                created_at: new Date()
            }
        };

        await collection.updateOne(
            { group_id: groupId },
            update,
            { upsert: true }
        );

        await client.close();

        return {
            text: '✅ Texto de anfitriã configurado com sucesso!',
            mentions: []
        };
    } catch (error) {
        console.error('Erro ao criar anfitriã:', error);
        return {
            text: '❌ Erro ao configurar texto de anfitriã.',
            mentions: []
        };
    }
}

async function verAnfitria(msg: WAMessage): Promise<CommandResponse> {
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();

        const db = client.db('AmandaeCBcoin');
        const collection = db.collection('group_settings');

        const groupId = msg.key.remoteJid;
        const settings = await collection.findOne({ group_id: groupId });

        await client.close();

        if (!settings || !settings.welcome_message) {
            return {
                text: '❌ Nenhum texto de anfitriã configurado para este grupo.',
                mentions: []
            };
        }

        return {
            text: `📝 *Texto de Anfitriã Atual*\n\n${settings.welcome_message}`,
            mentions: []
        };
    } catch (error) {
        console.error('Erro ao ver anfitriã:', error);
        return {
            text: '❌ Erro ao buscar texto de anfitriã.',
            mentions: []
        };
    }
}

async function apagarAnfitria(msg: WAMessage): Promise<CommandResponse> {
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();

        const db = client.db('AmandaeCBcoin');
        const collection = db.collection('group_settings');

        const groupId = msg.key.remoteJid;
        const result = await collection.updateOne(
            { group_id: groupId },
            { $unset: { welcome_message: "" } }
        );

        await client.close();

        if (result.matchedCount === 0) {
            return {
                text: '❌ Nenhum texto de anfitriã encontrado para este grupo.',
                mentions: []
            };
        }

        return {
            text: '✅ Texto de anfitriã removido com sucesso!',
            mentions: []
        };
    } catch (error) {
        console.error('Erro ao apagar anfitriã:', error);
        return {
            text: '❌ Erro ao remover texto de anfitriã.',
            mentions: []
        };
    }
}

async function resetPersonBot(msg: WAMessage): Promise<CommandResponse> {
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();

        const db = client.db('AmandaeCBcoin');
        const collection = db.collection('group_settings');

        const groupId = msg.key.remoteJid;
        const result = await collection.deleteOne({ group_id: groupId });

        await client.close();

        if (result.deletedCount === 0) {
            return {
                text: '❌ Nenhuma configuração encontrada para este grupo.',
                mentions: []
            };
        }

        return {
            text: '✅ Todas as configurações do grupo foram resetadas!',
            mentions: []
        };
    } catch (error) {
        console.error('Erro ao resetar configurações:', error);
        return {
            text: '❌ Erro ao resetar configurações do grupo.',
            mentions: []
        };
    }
} 
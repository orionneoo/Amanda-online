import { WAMessage } from '@whiskeysockets/baileys';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";
import db from '../../database/mongodb';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const PERSON_DIR = './PersonBOT';
const DEFAULT_CONFIG = path.join(PERSON_DIR, 'sys_inst.default.config');

function readSystemInstructions(configFile: string): string {
    try {
        if (!fs.existsSync(configFile)) {
            console.log(`⚠️ Arquivo de configuração ${configFile} não encontrado, usando padrão`);
            return fs.readFileSync(DEFAULT_CONFIG, 'utf8');
        }
        return fs.readFileSync(configFile, 'utf8');
    } catch (error) {
        console.error('❌ Erro ao ler instruções:', error);
        return '';
    }
}

interface GroupContext {
    name: string;
    memberCount: number;
    admins: string[];
}

interface MessageWithContext {
    user_name: string;
    user_id: string;
    message: string;
    is_admin: boolean;
    created_at: Date;
}

interface ParticipantInfo {
    name: string;
    id: string;
    isAdmin: boolean;
    messageCount: number;
}

export async function summarizeMessages(groupJid: string): Promise<string> {
    try {
        console.log('📝 Iniciando resumo das mensagens...');
        
        // Carrega as instruções de personalidade do grupo
        const configFileName = `sys_inst.${groupJid}.config`;
        const configFile = path.join(PERSON_DIR, configFileName);
        const personality = readSystemInstructions(configFile);
        
        if (!personality) {
            throw new Error('Não foi possível carregar as instruções de personalidade');
        }

        // Busca informações do grupo
        const groupInfo = await db.getGroupInfo(groupJid);
        const groupContext: GroupContext = {
            name: groupInfo.name,
            memberCount: groupInfo.member_count,
            admins: groupInfo.admins || []
        };

        // Busca mensagens das últimas 12 horas do banco de dados
        const twelveHoursAgo = new Date(Date.now() - (12 * 60 * 60 * 1000));
        const messages = await db.getMessagesByGroup(groupJid, twelveHoursAgo);

        if (!messages || messages.length === 0) {
            return '❌ Não encontrei mensagens das últimas 12 horas para resumir.';
        }

        // Coleta informações sobre os participantes
        const participants = new Map<string, ParticipantInfo>();
        messages.forEach(msg => {
            const participant = participants.get(msg.user_id) || {
                name: msg.user_name,
                id: msg.user_id,
                isAdmin: groupContext.admins.includes(msg.user_id),
                messageCount: 0
            };
            participant.messageCount++;
            participants.set(msg.user_id, participant);
        });

        // Identifica os participantes mais ativos (top 5)
        const topParticipants = Array.from(participants.values())
            .sort((a, b) => b.messageCount - a.messageCount)
            .slice(0, 5);

        // Formata as mensagens com contexto
        const formattedMessages = messages.map(msg => {
            const isAdmin = groupContext.admins.includes(msg.user_id);
            return `${msg.user_name}${isAdmin ? ' (Admin)' : ''}: ${msg.message}`;
        }).join('\n');

        // Prepara o prompt para o Gemini com contexto do grupo
        const prompt = `${personality}

Você é a Amanda, uma pessoa divertida e descontraída. Faça um resumo das conversas do grupo "${groupContext.name}" das últimas 12 horas.

Contexto do Grupo:
- Nome do grupo: ${groupContext.name}
- Número de membros: ${groupContext.memberCount}
- Total de mensagens no período: ${messages.length}

Participantes mais ativos:
${topParticipants.map(p => `- ${p.name}${p.isAdmin ? ' (Admin)' : ''}: ${p.messageCount} mensagens`).join('\n')}

Algumas regras importantes:
- Seja breve e direta
- Use linguagem informal e gírias
- Não mencione que você é uma IA
- Destaque os momentos mais interessantes e engraçados
- Mantenha o tom divertido e amigável
- Faça comentários sobre as interações mais marcantes
- Mencione interações entre admins e membros quando relevante
- Não cite horários específicos, use termos como "mais cedo", "depois", etc.
- Limite o resumo a no máximo 3 parágrafos
- Quando mencionar alguém, use o formato @nome da pessoa

Aqui estão as mensagens para resumir:

${formattedMessages}

Faça um resumo descontraído dessas conversas, considerando o contexto do grupo e marcando os participantes quando mencioná-los:`;

        // Gera o resumo usando o Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Substitui as menções por marcações do WhatsApp
        topParticipants.forEach(participant => {
            const regex = new RegExp(`@${participant.name}`, 'g');
            text = text.replace(regex, `@${participant.id.split('@')[0]}`);
        });

        console.log('✅ Resumo concluído com sucesso');
        
        return `📝 *Resuminho do ${groupContext.name}* 👀\n\n${text}`;

    } catch (error) {
        console.error('❌ Erro ao gerar resumo:', error);
        if (error instanceof Error) {
            return `❌ Erro ao gerar o resumo: ${error.message}`;
        }
        return '❌ Ocorreu um erro ao gerar o resumo. Por favor, tente novamente.';
    }
} 
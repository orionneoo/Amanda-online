import { WAMessage, downloadMediaMessage } from '@whiskeysockets/baileys';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const PERSON_DIR = './PersonBOT';
const DEFAULT_CONFIG = path.join(PERSON_DIR, 'sys_inst.default.config');
const PM_CONFIG = path.join(PERSON_DIR, 'sys_inst.light.config');

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
    error?: {
        message?: string;
    };
}

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

export async function analyzeImage(msg: WAMessage, sock: any): Promise<string> {
    try {
        console.log('🔍 Iniciando análise de imagem com Gemini 2.0 Flash...');
        
        // Verifica se é grupo ou privado
        const isGroup = msg.key.remoteJid?.endsWith('@g.us');
        const jid = msg.key.remoteJid;
        
        // Carrega as instruções de personalidade
        const configFileName = isGroup ? `sys_inst.${jid}.config` : 'sys_inst.light.config';
        const configFile = path.join(PERSON_DIR, configFileName);
        const personality = readSystemInstructions(configFile);
        
        if (!personality) {
            throw new Error('Não foi possível carregar as instruções de personalidade');
        }

        // Verifica se há uma imagem na mensagem (direta ou em resposta)
        let targetMsg = msg;
        
        // Se for uma resposta a uma mensagem com imagem
        if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            console.log('📸 Imagem encontrada em mensagem respondida');
            targetMsg = {
                ...msg,
                message: {
                    ...msg.message.extendedTextMessage.contextInfo.quotedMessage
                }
            };
        }

        // Verifica se há uma imagem para analisar
        if (!targetMsg.message?.imageMessage) {
            console.log('❌ Nenhuma imagem encontrada para análise');
            return '❌ Não encontrei nenhuma imagem para analisar. Por favor, envie uma imagem ou responda a uma mensagem com imagem.';
        }

        // Baixa a imagem
        console.log('⬇️ Baixando imagem...');
        const imageBuffer = await downloadImage(targetMsg, sock);
        if (!imageBuffer) {
            console.log('❌ Falha ao baixar imagem');
            return '❌ Não consegui baixar a imagem. Por favor, tente novamente.';
        }

        // Converte o buffer da imagem para base64
        const imageBase64 = imageBuffer.toString('base64');
        const mimeType = targetMsg.message.imageMessage.mimetype || 'image/jpeg';

        // Prepara o prompt personalizado para o Gemini Flash
        const prompt = `${personality}

Você é a Amanda, uma pessoa divertida e descontraída e safada. Olhe essa imagem e responda de forma natural, como se fosse uma amiga conversando no grupo.

Algumas regras importantes:
- Seja breve e direta
- Use linguagem informal e gírias
- Não mencione que você é uma IA
- Não dê detalhes técnicos sobre a imagem
- Mantenha o tom divertido e amigável
- Reaja à imagem como se fosse algo que uma amiga te enviou no WhatsApp

Descreva a imagem de forma natural:`;

        // Faz a requisição para a API do Gemini Flash
        console.log('🤖 Enviando imagem para análise rápida...');
        const response = await axios.post(
            GEMINI_API_URL,
            {
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: "image/jpeg",
                                    data: imageBase64
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 150,
                    topP: 0.8,
                    topK: 40
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_API_KEY
                }
            }
        );

        if (response.status !== 200) {
            throw new Error(`Erro na API do Gemini: ${response.statusText}`);
        }

        const responseData = response.data;
        if (!responseData.candidates || !responseData.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Resposta inválida da API do Gemini');
        }

        console.log('✅ Análise personalizada concluída com sucesso');
        
        // Formata a resposta de acordo com o tipo de chat
        const response_text = responseData.candidates[0].content.parts[0].text;
        if (isGroup) {
            return `Opa, e essa foto em? 👀\n\n${response_text}`;
        } else {
            return response_text; // No privado, envia só o texto para ser mais casual
        }

    } catch (error) {
        console.error('❌ Erro ao analisar imagem:', error);
        if (error instanceof Error) {
            return `❌ Erro ao analisar a imagem: ${error.message}`;
        }
        return '❌ Ocorreu um erro ao analisar a imagem. Por favor, tente novamente.';
    }
}

async function downloadImage(msg: WAMessage, sock: any): Promise<Buffer | null> {
    try {
        console.log('⬇️ Iniciando download da imagem...');
        const buffer = await downloadMediaMessage(
            msg,
            'buffer',
            {},
            {
                logger: sock.logger,
                reuploadRequest: sock.updateMediaMessage
            }
        );
        console.log('✅ Download da imagem concluído');
        return buffer as Buffer;
    } catch (error) {
        console.error('❌ Erro ao baixar imagem:', error);
        return null;
    }
} 
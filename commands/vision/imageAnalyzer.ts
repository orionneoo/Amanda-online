import { WAMessage, downloadMediaMessage } from '@whiskeysockets/baileys';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

export async function analyzeImage(msg: WAMessage, sock: any): Promise<string> {
    try {
        console.log('🔍 Iniciando análise de imagem com Gemini 2.0 Flash...');
        
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

        // Prepara o prompt para o Gemini Flash
        const prompt = {
            contents: [
                {
                    parts: [
                        {
                            text: "Descreva esta imagem em detalhes em português, de forma rápida e concisa. Inclua os elementos principais, cores e ações mais relevantes."
                        },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: imageBase64
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.4,
                topK: 32,
                topP: 1,
                maxOutputTokens: 200
            }
        };

        // Faz a requisição para a API do Gemini Flash
        console.log('🤖 Enviando imagem para análise rápida...');
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(prompt)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro na resposta da API:', errorText);
            throw new Error(`Erro na API do Gemini Flash: ${response.status} - ${errorText}`);
        }

        const data: GeminiResponse = await response.json();
        
        // Verifica se há erro na resposta
        if (data.error) {
            console.error('❌ Erro retornado pela API:', data.error);
            throw new Error(data.error.message || 'Erro desconhecido na API do Gemini');
        }

        // Verifica se há resposta válida
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.log('❌ Resposta da API não contém análise');
            throw new Error('A API não retornou uma análise válida');
        }

        console.log('✅ Análise rápida concluída com sucesso');
        return `🖼️ *Análise Rápida da Imagem*\n\n${data.candidates[0].content.parts[0].text}`;

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
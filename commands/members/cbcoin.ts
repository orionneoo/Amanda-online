import { WAMessage } from "@whiskeysockets/baileys";
import { CBCoinSystem, CommandResponse } from '../../amandacbcoin/src';
import * as dotenv from 'dotenv';

dotenv.config();

export class CBCoinCommands {
    private cbcoin: CBCoinSystem;
    private isInitialized: boolean = false;

    constructor() {
        const mongoUri = process.env.MONGODB_URI || '';
        this.cbcoin = new CBCoinSystem(mongoUri);
    }

    private async ensureInitialized() {
        if (!this.isInitialized) {
            try {
                await this.cbcoin.connect();
                this.isInitialized = true;
                console.log('✅ CBCoin System inicializado com sucesso!');
            } catch (error) {
                console.error('❌ Erro ao inicializar CBCoin System:', error);
                throw error;
            }
        }
    }

    async handleCommand(msg: WAMessage): Promise<CommandResponse> {
        try {
            await this.ensureInitialized();

            // Extrai o comando da mensagem
            const text = msg.message?.conversation || 
                        msg.message?.extendedTextMessage?.text || 
                        '';

            // Atualiza a mensagem com o comando
            const updatedMsg = {
                ...msg,
                message: {
                    ...msg.message,
                    conversation: text
                }
            };

            console.log('Processando comando CBCoin:', text);
            return await this.cbcoin.handleCommand(updatedMsg);
        } catch (error) {
            console.error('Erro ao processar comando CBCoin:', error);
            return {
                text: '❌ Ocorreu um erro ao processar o comando. Tente novamente mais tarde.',
                mentions: []
            };
        }
    }
}

export const cbcoinCommands = new CBCoinCommands();
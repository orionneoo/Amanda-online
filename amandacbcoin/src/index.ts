import { WAMessage } from '@whiskeysockets/baileys';
import { CBCoinSystem } from './CBCoinSystem';
import { config } from '../config';
import { CommandResponse } from './types';

export class CBCoinApp {
    private cbcoin: CBCoinSystem;

    constructor() {
        this.cbcoin = new CBCoinSystem(config.MONGODB_URI);
    }

    async start() {
        await this.cbcoin.connect();
        console.log('🎮 CBCoin System initialized successfully!');
    }

    async handleMessage(message: WAMessage): Promise<CommandResponse> {
        try {
            return await this.cbcoin.handleCommand(message);
        } catch (error) {
            console.error('Error handling CBCoin command:', error);
            return {
                text: '❌ Ocorreu um erro ao processar o comando. Tente novamente.',
                mentions: []
            };
        }
    }

    async stop() {
        await this.cbcoin.disconnect();
        console.log('🛑 CBCoin System stopped.');
    }
}

export const cbcoinApp = new CBCoinApp();

// Re-export everything needed
export * from './types';
export * from './database/Database';
export * from './CBCoinSystem';
export * from './bank/BankManager'; 
import { Database } from '../database/Database';
import { User, GameResult } from '../types';

export class GamesManager {
    private database: Database;

    constructor(database: Database) {
        this.database = database;
    }

    async playFlip(user: User, amount: number, choice: string): Promise<{ text: string; mentions: string[] }> {
        if (amount < 100) {
            return { text: '❌ A aposta mínima é de 100 CBCoins!', mentions: [] };
        }

        if (user.balance < amount) {
            return { text: '❌ Você não tem CBCoins suficientes para apostar esse valor!', mentions: [] };
        }

        const result = Math.random() < 0.5 ? "cara" : "coroa";
        const won = result === choice;
        const winAmount = Math.floor(amount * 1.8); // 80% de lucro

        if (won) {
            await this.database.updateUser(user.user_id, user.group_id, {
                balance: user.balance + winAmount - amount
            });
            return {
                text: `🎲 *CARA OU COROA*\n\nDeu ${result}!\n🎯 Você ganhou!\n💰 Lucro: ${winAmount - amount} CBCoins\n💵 Novo saldo: ${user.balance + winAmount - amount} CBCoins`,
                mentions: []
            };
        } else {
            await this.database.updateUser(user.user_id, user.group_id, {
                balance: user.balance - amount
            });
            return {
                text: `🎲 *CARA OU COROA*\n\nDeu ${result}!\n❌ Você perdeu!\n💸 Prejuízo: ${amount} CBCoins\n�� Novo saldo: ${user.balance - amount} CBCoins`,
                mentions: []
            };
        }
    }

    async playSlots(user: User, amount: number): Promise<{ text: string; mentions: string[] }> {
        if (amount < 100) {
            return { text: '❌ A aposta mínima é de 100 CBCoins!', mentions: [] };
        }

        if (user.balance < amount) {
            return { text: '❌ Você não tem CBCoins suficientes para apostar esse valor!', mentions: [] };
        }

        const slots = ['🍎', '🍊', '🍇', '🍓', '💎', '7️⃣'];
        const result = [
            slots[Math.floor(Math.random() * slots.length)],
            slots[Math.floor(Math.random() * slots.length)],
            slots[Math.floor(Math.random() * slots.length)]
        ];

        let multiplier = 0;
        if (result[0] === result[1] && result[1] === result[2]) {
            if (result[0] === '7️⃣') multiplier = 10;
            else if (result[0] === '💎') multiplier = 7;
            else multiplier = 3;
        } else if (result[0] === result[1] || result[1] === result[2]) {
            multiplier = 1.5;
        }

        const winAmount = Math.floor(amount * multiplier);
        const profit = winAmount - amount;

        if (multiplier > 0) {
            await this.database.updateUser(user.user_id, user.group_id, {
                balance: user.balance + profit
            });
            return {
                text: `🎰 *SLOTS*\n\n${result.join(' ')}\n\n🎯 Você ganhou!\n💰 Lucro: ${profit} CBCoins\n💵 Novo saldo: ${user.balance + profit} CBCoins`,
                mentions: []
            };
        } else {
            await this.database.updateUser(user.user_id, user.group_id, {
                balance: user.balance - amount
            });
            return {
                text: `🎰 *SLOTS*\n\n${result.join(' ')}\n\n❌ Você perdeu!\n💸 Prejuízo: ${amount} CBCoins\n💵 Novo saldo: ${user.balance - amount} CBCoins`,
                mentions: []
            };
        }
    }

    async roulette(user: User, bet: number, choice: 'red' | 'black' | 'green'): Promise<string> {
        // Verifica se a aposta é válida
        if (bet < 100 || bet > 50000) {
            return '❌ A aposta deve ser entre 100 e 50,000 CBCoins!';
        }

        if (user.balance < bet) {
            return '❌ Você não tem CBCoins suficientes para esta aposta!';
        }

        // Gera um número aleatório (0-36)
        const number = Math.floor(Math.random() * 37);
        
        // Define a cor do número
        let color: 'red' | 'black' | 'green';
        if (number === 0) color = 'green';
        else if ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(number)) color = 'red';
        else color = 'black';

        // Calcula o prêmio
        let multiplier = 0;
        if (color === choice) {
            multiplier = color === 'green' ? 14 : 2;
        }

        const prize = bet * multiplier;
        
        // Atualiza o saldo
        await this.database.updateUser(user.user_id, user.group_id, {
            balance: user.balance + (prize - bet)
        });

        let response = `🎲 Roleta: ${number} (${color})\n\n`;
        
        if (multiplier > 0) {
            response += `✨ Você ganhou ${prize} CBCoins! (${multiplier}x)`;
        } else {
            response += `❌ Você perdeu ${bet} CBCoins!`;
        }

        return response;
    }
} 
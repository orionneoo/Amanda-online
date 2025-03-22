import { Database } from '../database/Database';
import { User, SpecialItem } from '../types';

const MAX_MINES_PER_DAY = 50;
const COOLDOWN = 10 * 1000; // 10 segundos em milissegundos

const SPECIAL_ITEMS: SpecialItem[] = [
    {
        id: 'diamond',
        name: '💎 Diamante Raro',
        description: 'Aumenta seu XP em 1.5x',
        price: 10000,
        available: true,
        effect: {
            type: 'xp_boost',
            value: 1.5
        }
    },
    {
        id: 'star',
        name: '🌟 Estrela Luminosa',
        description: 'Aumenta seu multiplicador de trabalho em 1.2x',
        price: 15000,
        available: true,
        effect: {
            type: 'work_multiplier',
            value: 1.2
        }
    },
    {
        id: 'crystal',
        name: '🎇 Cristal Mágico',
        description: 'Aumenta sua chance de roubo em 0.1',
        price: 20000,
        available: true,
        effect: {
            type: 'rob_chance',
            value: 0.1
        }
    }
];

export class MiningManager {
    constructor(private database: Database) {}

    async mine(user: User): Promise<{ text: string, xpGained?: number, mentions: string[] }> {
        const now = new Date();

        // Verifica se precisa resetar o contador diário
        if (this.shouldResetDailyCount(user.last_mine_reset)) {
            await this.database.updateUser(user.user_id, user.group_id, {
                mine_count: 0,
                last_mine_reset: now
            });
            user.mine_count = 0;
        }

        // Verifica se atingiu o limite diário
        if (user.mine_count >= MAX_MINES_PER_DAY) {
            const nextReset = this.getNextResetTime(user.last_mine_reset || now);
            const timeUntilReset = this.getTimeUntilReset(nextReset);
            return {
                text: `❌ @${user.name} você já minerou ${MAX_MINES_PER_DAY} vezes hoje! Aguarde ${timeUntilReset} para minerar novamente.`,
                mentions: [user.user_id]
            };
        }

        // Verifica o cooldown entre minerações
        if (user.last_mine) {
            const timeSinceLastMine = now.getTime() - user.last_mine.getTime();
            if (timeSinceLastMine < COOLDOWN) {
                const remainingTime = this.formatRemainingTime(COOLDOWN - timeSinceLastMine);
                return {
                    text: `❌ @${user.name} você precisa descansar da última mineração! Aguarde ${remainingTime}.`,
                    mentions: [user.user_id]
                };
            }
        }

        // Calcula a recompensa
        const baseAmount = 1000;
        const bonusAmount = Math.floor(Math.random() * 4000); // Até 4000 de bônus
        const totalAmount = baseAmount + bonusAmount;

        // Chance de encontrar item especial (10%)
        let specialItemFound: SpecialItem | null = null;
        if (Math.random() < 0.1) {
            specialItemFound = this.getRandomSpecialItem();
            if (!user.inventory) user.inventory = [];
            user.inventory.push(specialItemFound);
        }

        // Atualiza o usuário
        const update: Partial<User> = {
            last_mine: now,
            mine_count: (user.mine_count || 0) + 1,
            balance: user.balance + totalAmount
        };

        if (specialItemFound) {
            update.inventory = user.inventory;
        }

        await this.database.updateUser(user.user_id, user.group_id, update);

        // Ganha XP apenas se encontrou item especial ou quantidade alta de CBCoins
        let xpGained: number | undefined;
        if (specialItemFound || totalAmount > 3000) {
            xpGained = Math.floor(Math.random() * 50) + 50;
            await this.database.updateUser(user.user_id, user.group_id, {
                xp: user.xp + xpGained
            });
        }

        let response = `⛏️ @${user.name} minerou e encontrou ${totalAmount} CBCoins!`;
        if (specialItemFound) {
            response += `\n\n🎉 Você também encontrou um item especial: ${specialItemFound.name}!`;
        }

        return {
            text: response,
            xpGained,
            mentions: [user.user_id]
        };
    }

    private shouldResetDailyCount(lastReset: Date | null): boolean {
        if (!lastReset) return true;
        
        const now = new Date();
        const reset = new Date(lastReset);
        return now.getDate() !== reset.getDate() ||
               now.getMonth() !== reset.getMonth() ||
               now.getFullYear() !== reset.getFullYear();
    }

    private getNextResetTime(lastReset: Date): Date {
        const nextReset = new Date(lastReset);
        nextReset.setDate(nextReset.getDate() + 1);
        nextReset.setHours(0, 0, 0, 0);
        return nextReset;
    }

    private getTimeUntilReset(nextReset: Date): string {
        const now = new Date();
        const timeUntilReset = nextReset.getTime() - now.getTime();
        return this.formatRemainingTime(timeUntilReset);
    }

    private formatRemainingTime(milliseconds: number): string {
        const hours = Math.floor(milliseconds / (60 * 60 * 1000));
        const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }

    private getRandomSpecialItem(): SpecialItem {
        return SPECIAL_ITEMS[Math.floor(Math.random() * SPECIAL_ITEMS.length)];
    }
} 
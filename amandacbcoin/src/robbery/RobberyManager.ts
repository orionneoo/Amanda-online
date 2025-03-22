import { Database } from '../database/Database';
import { User } from '../types';

export class RobberyManager {
    constructor(private database: Database) {}

    async rob(user: User, target: User): Promise<{ text: string, xpGained?: number, mentions: string[] }> {
        const now = new Date();

        // Verifica se precisa resetar o contador diário
        if (this.shouldResetDailyCount(user.last_rob_reset)) {
            await this.database.updateUser(user.user_id, user.group_id, {
                rob_count: 0,
                last_rob_reset: now
            });
            user.rob_count = 0;
        }

        // Verifica se atingiu o limite diário
        if (user.rob_count >= 50) {
            const nextReset = this.getNextResetTime(user.last_rob_reset || now);
            const timeUntilReset = this.getTimeUntilReset(nextReset);
            return {
                text: `❌ @${user.name} você já roubou 50 vezes hoje! Aguarde ${timeUntilReset} para roubar novamente.`,
                mentions: [user.user_id]
            };
        }

        // Verifica o cooldown entre roubos
        if (user.last_rob) {
            const timeSinceLastRob = now.getTime() - user.last_rob.getTime();
            const cooldown = 10 * 1000; // 10 segundos
            if (timeSinceLastRob < cooldown) {
                const remainingTime = this.formatRemainingTime(cooldown - timeSinceLastRob);
                return {
                    text: `❌ @${user.name} você precisa esperar ${remainingTime} para roubar novamente!`,
                    mentions: [user.user_id]
                };
            }
        }

        if (target.balance < 100) {
            return {
                text: `❌ @${target.name} está muito pobre para ser roubado!`,
                mentions: [user.user_id, target.user_id]
            };
        }

        const maxRobAmount = Math.min(target.balance * 0.3, 5000);
        const robAmount = Math.floor(Math.random() * maxRobAmount);
        const baseSuccessChance = 0.6;
        const finalSuccessChance = Math.min(baseSuccessChance + (user.skills.rob_chance || 0), 0.9);

        if (Math.random() < finalSuccessChance) {
            await this.database.updateUser(user.user_id, user.group_id, {
                last_rob: now,
                rob_count: (user.rob_count || 0) + 1,
                balance: user.balance + robAmount
            });

            await this.database.updateUser(target.user_id, target.group_id, {
                balance: target.balance - robAmount
            });

            const xpGained = Math.floor(Math.random() * 60) + 60;
            await this.database.updateUser(user.user_id, user.group_id, {
                xp: user.xp + xpGained
            });

            return {
                text: `🦹‍♂️ @${user.name} roubou ${robAmount} CBCoins de @${target.name}!`,
                xpGained,
                mentions: [user.user_id, target.user_id]
            };
        } else {
            const fine = Math.floor(robAmount * 0.5);
            await this.database.updateUser(user.user_id, user.group_id, {
                last_rob: now,
                rob_count: (user.rob_count || 0) + 1,
                balance: user.balance - fine
            });

            return {
                text: `🚔 @${user.name} tentou roubar @${target.name} mas foi pego e perdeu ${fine} CBCoins!`,
                mentions: [user.user_id, target.user_id]
            };
        }
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
} 
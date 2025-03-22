import { Database } from '../database/Database';
import { User } from '../types/User';

export class DailyManager {
    constructor(private database: Database) {}

    async claimDaily(user: User): Promise<{ text: string, mentions: string[] }> {
        const now = new Date();
        const lastDaily = new Date(user.last_daily);
        const cooldown = 10 * 1000; // 10 segundos em milissegundos

        if (now.getTime() - lastDaily.getTime() < cooldown) {
            const remainingTime = cooldown - (now.getTime() - lastDaily.getTime());
            const seconds = Math.floor(remainingTime / 1000);
            return {
                text: `❌ @${user.name} você já recebeu sua recompensa diária! Aguarde ${seconds}s.`,
                mentions: [user.user_id]
            };
        }

        const baseAmount = 1000;
        const bonusAmount = Math.floor(Math.random() * 500);
        const totalAmount = baseAmount + bonusAmount;

        await this.database.updateUser(user.user_id, user.group_id, {
            last_daily: now,
            balance: user.balance + totalAmount
        });

        return {
            text: `✅ @${user.name} recebeu ${totalAmount} CBCoins de recompensa diária!`,
            mentions: [user.user_id]
        };
    }
} 
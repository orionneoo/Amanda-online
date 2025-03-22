import { Database } from '../database/Database';
import { User } from '../types';

const JOBS = [
    {
        name: 'Programador',
        baseAmount: 1000,
        successRate: 0.8,
        failMessage: 'Você cometeu um erro no código e perdeu o trabalho.'
    },
    {
        name: 'Designer',
        baseAmount: 800,
        successRate: 0.85,
        failMessage: 'O cliente não gostou do seu design.'
    },
    {
        name: 'Escritor',
        baseAmount: 700,
        successRate: 0.9,
        failMessage: 'Seu texto tinha muitos erros de gramática.'
    },
    {
        name: 'Vendedor',
        baseAmount: 1200,
        successRate: 0.7,
        failMessage: 'Você não conseguiu fazer nenhuma venda hoje.'
    }
];

export class WorkManager {
    constructor(private database: Database) {}

    async work(user: User): Promise<{ text: string, xpGained?: number, mentions: string[] }> {
        const now = new Date();
        const lastWork = new Date(user.last_work);
        const cooldown = 10 * 1000; // 10 segundos em milissegundos

        if (now.getTime() - lastWork.getTime() < cooldown) {
            const remainingTime = cooldown - (now.getTime() - lastWork.getTime());
            const seconds = Math.floor((remainingTime % 1000) / 1000);
            return {
                text: `❌ @${user.name} você precisa descansar! Aguarde ${seconds}s.`,
                mentions: [user.user_id]
            };
        }

        const job = JOBS[Math.floor(Math.random() * JOBS.length)];
        const success = Math.random() < job.successRate;

        await this.database.updateUser(user.user_id, user.group_id, {
            last_work: now
        });

        if (success) {
            const multiplier = user.skills?.work_multiplier || 1;
            const amount = Math.floor(job.baseAmount * multiplier);
            
            await this.database.updateUser(user.user_id, user.group_id, {
                balance: user.balance + amount
            });

            // Ganha XP apenas no sucesso
            const xpGained = Math.floor(Math.random() * 40) + 40;
            await this.database.updateUser(user.user_id, user.group_id, {
                xp: user.xp + xpGained
            });

            return {
                text: `💼 @${user.name} trabalhou como ${job.name} e ganhou ${amount} CBCoins!`,
                xpGained,
                mentions: [user.user_id]
            };
        } else {
            return {
                text: `❌ @${user.name} ${job.failMessage}`,
                mentions: [user.user_id]
            };
        }
    }
} 
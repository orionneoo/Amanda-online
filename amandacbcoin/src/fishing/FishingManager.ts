import { Database } from '../database/Database';
import { User, Fish, FishingRod, FishingResult } from '../types';

const FISH_LIST: Fish[] = [
    {
        id: 'sardinha',
        name: 'Sardinha',
        emoji: '🐟',
        rarity: 'comum',
        value: 100,
        xp: 20,
        chance: 0.4
    },
    {
        id: 'atum',
        name: 'Atum',
        emoji: '🐠',
        rarity: 'incomum',
        value: 250,
        xp: 40,
        chance: 0.25
    },
    {
        id: 'salmao',
        name: 'Salmão',
        emoji: '🐡',
        rarity: 'raro',
        value: 500,
        xp: 80,
        chance: 0.15
    },
    {
        id: 'polvo',
        name: 'Polvo',
        emoji: '🐙',
        rarity: 'épico',
        value: 1000,
        xp: 150,
        chance: 0.15
    },
    {
        id: 'baleia',
        name: 'Baleia',
        emoji: '🐋',
        rarity: 'lendário',
        value: 2000,
        xp: 300,
        chance: 0.05
    }
];

const FISHING_RODS: FishingRod[] = [
    {
        id: 'vara_iniciante',
        name: 'Vara de Iniciante',
        emoji: '🎣',
        price: 1000,
        durability: 50,
        multiplier: 1,
        description: 'Uma vara básica para começar sua jornada de pescador',
        minLevel: 1
    },
    {
        id: 'vara_profissional',
        name: 'Vara Profissional',
        emoji: '🎣',
        price: 5000,
        durability: 100,
        multiplier: 1.5,
        description: 'Uma vara resistente com maior chance de peixes raros',
        minLevel: 5
    },
    {
        id: 'vara_mestre',
        name: 'Vara do Mestre',
        emoji: '🎣',
        price: 15000,
        durability: 200,
        multiplier: 2,
        description: 'A melhor vara de pesca disponível',
        minLevel: 10
    }
];

export class FishingManager {
    private readonly DAILY_FISH_LIMIT = 50;
    private readonly COOLDOWN = 30 * 1000; // 30 segundos

    constructor(private database: Database) {}

    async fish(user: User): Promise<{ text: string, xpGained?: number, mentions: string[] }> {
        try {
            const now = new Date();

            // Verifica se precisa resetar o contador diário
            if (this.shouldResetDailyCount(user.last_fish_reset)) {
                await this.database.updateUser(user.user_id, user.group_id, {
                    fish_count: 0,
                    last_fish_reset: now
                });
                user.fish_count = 0;
            }

            // Verifica se atingiu o limite diário
            if (user.fish_count >= this.DAILY_FISH_LIMIT) {
                const nextReset = this.getNextResetTime(user.last_fish_reset || now);
                const timeUntilReset = this.getTimeUntilReset(nextReset);
                return {
                    text: `❌ @${user.name} você já pescou ${this.DAILY_FISH_LIMIT} vezes hoje! Aguarde ${timeUntilReset} para pescar novamente.`,
                    mentions: [user.user_id]
                };
            }

            // Verifica o cooldown
            if (user.last_fish) {
                const timeSinceLastFish = now.getTime() - user.last_fish.getTime();
                if (timeSinceLastFish < this.COOLDOWN) {
                    const remainingTime = this.formatRemainingTime(this.COOLDOWN - timeSinceLastFish);
                    return {
                        text: `❌ @${user.name} você precisa esperar ${remainingTime} para pescar novamente!`,
                        mentions: [user.user_id]
                    };
                }
            }

            // Verifica se tem vara de pesca
            const rod = this.findFishingRod(user);
            if (!rod) {
                return {
                    text: `❌ @${user.name} você precisa de uma vara de pesca!\n\nCompre uma na loja usando:\n!comprar vara_iniciante`,
                    mentions: [user.user_id]
                };
            }

            // Realiza a pescaria
            const result = this.tryFishing(rod);

            // Atualiza o usuário
            const updates: Partial<User> = {
                last_fish: now,
                fish_count: (user.fish_count || 0) + 1,
                balance: user.balance + result.coins,
                xp: user.xp + result.xp
            };

            await this.database.updateUser(user.user_id, user.group_id, updates);

            // Formata a mensagem de resultado
            let message = '';
            if (result.success && result.fish) {
                message = `🎣 @${user.name} pescou um ${result.fish.emoji} ${result.fish.name}!\n` +
                         `💰 Valor: ${result.coins} CBCoins\n` +
                         `✨ XP ganho: ${result.xp}\n` +
                         `📊 Raridade: ${result.fish.rarity}`;
            } else {
                message = `😢 @${user.name} não pescou nada desta vez...`;
            }

            // Adiciona informação sobre dano na vara
            message += `\n🎣 Durabilidade da vara: ${Math.max(0, rod.durability - result.rodDamage)}`;

            return {
                text: message,
                xpGained: result.xp,
                mentions: [user.user_id]
            };

        } catch (error) {
            console.error('Erro ao pescar:', error);
            return {
                text: '❌ Ocorreu um erro ao pescar. Tente novamente.',
                mentions: [user.user_id]
            };
        }
    }

    private findFishingRod(user: User): FishingRod | null {
        const rod = user.inventory.find(item => 
            FISHING_RODS.some(r => r.id === item.id)
        );

        if (!rod) return null;

        return FISHING_RODS.find(r => r.id === rod.id) || null;
    }

    private tryFishing(rod: FishingRod): FishingResult {
        // Aplica o multiplicador da vara
        const catchChance = Math.random() * rod.multiplier;

        // Tenta pegar um peixe
        let caughtFish: Fish | undefined;
        for (const fish of FISH_LIST) {
            if (catchChance <= fish.chance * rod.multiplier) {
                caughtFish = fish;
                break;
            }
        }

        // Calcula dano na vara (1-3 pontos de durabilidade)
        const rodDamage = Math.floor(Math.random() * 3) + 1;

        if (!caughtFish) {
            return {
                success: false,
                coins: 0,
                xp: 10, // XP mínimo mesmo sem pegar nada
                message: 'Não pescou nada',
                rodDamage
            };
        }

        return {
            success: true,
            fish: caughtFish,
            coins: caughtFish.value,
            xp: caughtFish.xp,
            message: `Pescou um ${caughtFish.name}!`,
            rodDamage
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
} 
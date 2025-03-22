import { Database } from '../database/Database';
import { User, Crop, Seed, FarmingResult } from '../types';
import { addXP } from '../utils/xp';

// Constantes para sementes disponíveis
export const SEEDS: Seed[] = [
    {
        id: 'semente_cenoura',
        name: 'Semente de Cenoura',
        emoji: '🥕',
        price: 100,
        description: 'Uma semente comum de cenoura',
        minLevel: 1,
        cropId: 'cenoura',
        growthTime: 5 * 60 * 1000, // 5 minutos
        harvestWindow: 10 * 60 * 1000 // 10 minutos
    },
    {
        id: 'semente_tomate',
        name: 'Semente de Tomate',
        emoji: '🍅',
        price: 250,
        description: 'Uma semente de tomate suculento',
        minLevel: 5,
        cropId: 'tomate',
        growthTime: 10 * 60 * 1000, // 10 minutos
        harvestWindow: 15 * 60 * 1000 // 15 minutos
    },
    {
        id: 'semente_abacaxi',
        name: 'Semente de Abacaxi',
        emoji: '🍍',
        price: 500,
        description: 'Uma semente rara de abacaxi',
        minLevel: 10,
        cropId: 'abacaxi',
        growthTime: 20 * 60 * 1000, // 20 minutos
        harvestWindow: 30 * 60 * 1000 // 30 minutos
    }
];

// Constantes para plantações
export const CROPS: Crop[] = [
    {
        id: 'cenoura',
        name: 'Cenoura',
        emoji: '🥕',
        rarity: 'comum',
        value: 200,
        xp: 50,
        growthTime: 5 * 60 * 1000,
        plantedAt: new Date(),
        readyAt: new Date(),
        harvestWindow: 10 * 60 * 1000
    },
    {
        id: 'tomate',
        name: 'Tomate',
        emoji: '🍅',
        rarity: 'incomum',
        value: 500,
        xp: 100,
        growthTime: 10 * 60 * 1000,
        plantedAt: new Date(),
        readyAt: new Date(),
        harvestWindow: 15 * 60 * 1000
    },
    {
        id: 'abacaxi',
        name: 'Abacaxi',
        emoji: '🍍',
        rarity: 'raro',
        value: 1000,
        xp: 200,
        growthTime: 20 * 60 * 1000,
        plantedAt: new Date(),
        readyAt: new Date(),
        harvestWindow: 30 * 60 * 1000
    }
];

export class FarmingManager {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    public async plant(userId: string, groupId: string, seedId: string): Promise<FarmingResult> {
        const user = await this.db.getUser(userId, groupId);
        if (!user) {
            return {
                success: false,
                coins: 0,
                xp: 0,
                message: '❌ Usuário não encontrado!'
            };
        }

        // Verifica se o usuário já tem uma plantação ativa
        if (user.crops && user.crops.length > 0) {
            return {
                success: false,
                coins: 0,
                xp: 0,
                message: '❌ Você já tem uma plantação ativa! Use !colher para colher sua plantação atual.'
            };
        }

        // Encontra a semente no inventário
        const seed = SEEDS.find(s => s.id === seedId);
        if (!seed) {
            return {
                success: false,
                coins: 0,
                xp: 0,
                message: '❌ Semente não encontrada!'
            };
        }

        // Verifica se o usuário tem nível suficiente
        if (user.level < seed.minLevel) {
            return {
                success: false,
                coins: 0,
                xp: 0,
                message: `❌ Você precisa ser nível ${seed.minLevel} para plantar ${seed.name}!`
            };
        }

        // Verifica se o usuário tem moedas suficientes
        if (user.balance < seed.price) {
            return {
                success: false,
                coins: 0,
                xp: 0,
                message: `❌ Você precisa de ${seed.price} CBCoins para comprar ${seed.name}!`
            };
        }

        // Cria a nova plantação
        const now = new Date();
        const crop = CROPS.find(c => c.id === seed.cropId);
        if (!crop) {
            return {
                success: false,
                coins: 0,
                xp: 0,
                message: '❌ Erro ao criar plantação!'
            };
        }

        const newCrop: Crop = {
            ...crop,
            plantedAt: now,
            readyAt: new Date(now.getTime() + seed.growthTime)
        };

        // Atualiza o usuário
        await this.db.updateUser(userId, groupId, {
            balance: user.balance - seed.price,
            last_plant: now,
            crops: [newCrop]
        });

        const timeToGrow = this.formatTime(seed.growthTime);
        return {
            success: true,
            coins: -seed.price,
            xp: 0,
            message: `✅ Você plantou ${seed.name} ${seed.emoji}!\nSua plantação estará pronta em ${timeToGrow}.`
        };
    }

    public async harvest(userId: string, groupId: string): Promise<FarmingResult> {
        const user = await this.db.getUser(userId, groupId);
        if (!user) {
            return {
                success: false,
                coins: 0,
                xp: 0,
                message: '❌ Usuário não encontrado!'
            };
        }

        // Verifica se o usuário tem uma plantação
        if (!user.crops || user.crops.length === 0) {
            return {
                success: false,
                coins: 0,
                xp: 0,
                message: '❌ Você não tem nenhuma plantação para colher!'
            };
        }

        const crop = user.crops[0];
        const now = new Date();

        // Verifica se a plantação está pronta
        if (now < crop.readyAt) {
            const timeLeft = this.formatTime(crop.readyAt.getTime() - now.getTime());
            return {
                success: false,
                coins: 0,
                xp: 0,
                message: `❌ Sua plantação ainda não está pronta! Faltam ${timeLeft}.`
            };
        }

        // Verifica se a plantação não passou do tempo de colheita
        const harvestDeadline = new Date(crop.readyAt.getTime() + crop.harvestWindow);
        if (now > harvestDeadline) {
            await this.db.updateUser(userId, groupId, {
                crops: []
            });
            return {
                success: false,
                coins: 0,
                xp: 0,
                message: '❌ Sua plantação apodreceu! Você demorou muito para colher.'
            };
        }

        // Calcula bônus baseado no tempo de colheita
        const timeSinceReady = now.getTime() - crop.readyAt.getTime();
        const bonusMultiplier = Math.max(0, 1 - (timeSinceReady / crop.harvestWindow));
        const coins = Math.floor(crop.value * bonusMultiplier);
        const xp = Math.floor(crop.xp * bonusMultiplier);

        // Atualiza o usuário
        await this.db.updateUser(userId, groupId, {
            balance: user.balance + coins,
            last_harvest: now,
            crops: []
        });

        // Adiciona XP
        await addXP(this.db, userId, groupId, xp);

        return {
            success: true,
            crop,
            coins,
            xp,
            message: `✅ Você colheu ${crop.name} ${crop.emoji} e ganhou:\n💰 ${coins} CBCoins\n✨ ${xp} XP`
        };
    }

    public formatTime(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
} 
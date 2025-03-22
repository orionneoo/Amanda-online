export * from './User';
export * from './SpecialItem';

export interface UserSkills {
    farming: number;    // Agricultura
    mining: number;     // Mineração
    fishing: number;    // Pesca
    trading: number;    // Comércio
    gambling: number;   // Apostas
    xp_boost: number;   // Multiplicador de XP
    work_multiplier: number; // Multiplicador de trabalho
    rob_chance: number; // Chance de roubo
}

export interface ItemEffect {
    type: 'xp_boost' | 'work_multiplier' | 'rob_chance' | 'fishing' | 'farming';
    value: number;
    duration?: number;
    activeUntil?: Date;
}

export interface SpecialItem {
    id: string;
    name: string;
    description: string;
    price: number;
    available: boolean;
    minLevel?: number;
    effect: ItemEffect;
    activeUntil?: Date;
}

export interface User {
    user_id: string;
    group_id: string;
    name: string;
    balance: number;
    xp: number;
    level: number;
    skills: UserSkills;
    inventory: SpecialItem[];
    achievements: string[];
    last_daily: Date | null;
    last_work: Date | null;
    last_mine: Date | null;
    last_mine_reset: Date | null;
    mine_count: number;
    last_rob: Date | null;
    last_rob_reset: Date | null;
    rob_count: number;
    last_fish: Date | null;
    last_fish_reset: Date | null;
    fish_count: number;
    last_plant: Date | null;
    last_harvest: Date | null;
    crops: Crop[];
    effects: {
        xp_boost?: ItemEffect;
        work_multiplier?: ItemEffect;
        rob_chance?: ItemEffect;
        fishing?: ItemEffect;
        farming?: ItemEffect;
    };
    created_at: Date;
    updated_at: Date;
}

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    type: ItemType;
    effects?: ItemEffects;
}

export enum ItemType {
    COLLECTIBLE = 'collectible',
    BADGE = 'badge',
    BOOSTER = 'booster',
    TOOL = 'tool'
}

export interface ItemEffects {
    workMultiplier?: number;
    dailyMultiplier?: number;
    robChance?: number;
    xpBoost?: number;
}

export interface ShopItem extends SpecialItem {
    emoji: string;
    price: number;
    available: boolean;
    minLevel?: number;
    keywords?: string[];
}

export interface CommandResponse {
    text: string;
    mentions: string[];
    xp_gained?: number;
}

export interface GameResult {
    won: boolean;
    amount: number;
    message: string;
    xp_gained?: number;
}

export interface Transfer {
    sender_id: string;
    receiver_id: string;
    amount: number;
    tax: number;
    created_at: Date;
}

export interface Bank {
    group_id: string;
    balance: number;  // Saldo total do banco (taxas acumuladas)
    total_tax_collected: number;  // Total de taxas coletadas
    total_transfers: number;  // Número total de transferências
    created_at: Date;
    updated_at: Date;
}

export interface Fish {
    id: string;
    name: string;
    emoji: string;
    rarity: 'comum' | 'incomum' | 'raro' | 'épico' | 'lendário';
    value: number;
    xp: number;
    chance: number;
}

export interface FishingRod {
    id: string;
    name: string;
    emoji: string;
    price: number;
    durability: number;
    multiplier: number;
    description: string;
    minLevel: number;
}

export interface FishingResult {
    success: boolean;
    fish?: Fish;
    coins: number;
    xp: number;
    message: string;
    rodDamage: number;
}

export interface Crop {
    id: string;
    name: string;
    emoji: string;
    rarity: 'comum' | 'incomum' | 'raro' | 'épico' | 'lendário';
    value: number;
    xp: number;
    growthTime: number; // Tempo em milissegundos
    plantedAt: Date;
    readyAt: Date;
    harvestWindow: number; // Tempo em milissegundos para colher após maduro
}

export interface Seed {
    id: string;
    name: string;
    emoji: string;
    price: number;
    description: string;
    minLevel: number;
    cropId: string; // ID da plantação que essa semente produz
    growthTime: number; // Tempo em milissegundos
    harvestWindow: number; // Tempo em milissegundos para colher após maduro
}

export interface FarmingResult {
    success: boolean;
    crop?: Crop;
    coins: number;
    xp: number;
    message: string;
}
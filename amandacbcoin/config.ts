import * as dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

export interface Config {
    // Configurações do MongoDB
    MONGODB_URI: string;

    // Configurações de recompensas diárias
    DAILY_MIN: number;
    DAILY_MAX: number;
    DAILY_COOLDOWN: number;

    // Configurações de trabalho
    WORK_MIN: number;
    WORK_MAX: number;
    WORK_COOLDOWN: number;

    // Configurações de roubo
    ROB_COOLDOWN: number;
    ROB_SUCCESS_RATE: number;
    ROB_MAX_STEAL_PERCENT: number;
    ROB_PENALTY_PERCENT: number;
    MIN_ROB_BALANCE: number;

    // Configurações de níveis
    XP_PER_LEVEL: number;
    LEVEL_MULTIPLIER: number;
    MAX_LEVEL: number;

    // Configurações de jogos
    MIN_BET: number;
    MAX_BET: number;
    SLOTS_MULTIPLIERS: {
        TRIPLE_SEVEN: number;
        TRIPLE_DIAMOND: number;
        TRIPLE_NORMAL: number;
        DOUBLE: number;
    };
    ROULETTE_MULTIPLIERS: {
        GREEN: number;
        RED_BLACK: number;
    };

    // Configurações de loja
    SHOP_SELL_MULTIPLIER: number;
    INVENTORY_MAX_ITEMS: number;
}

export const config: Config = {
    // MongoDB
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cbcoin',

    // Recompensas diárias
    DAILY_MIN: 500,
    DAILY_MAX: 1500,
    DAILY_COOLDOWN: 24 * 60 * 60 * 1000, // 24 horas

    // Trabalho
    WORK_MIN: 200,
    WORK_MAX: 500,
    WORK_COOLDOWN: 60 * 60 * 1000, // 1 hora

    // Roubo
    ROB_COOLDOWN: 2 * 60 * 60 * 1000, // 2 horas
    ROB_SUCCESS_RATE: 0.5, // 50% chance
    ROB_MAX_STEAL_PERCENT: 0.3, // Pode roubar até 30% do saldo
    ROB_PENALTY_PERCENT: 0.1, // Perde 10% do próprio saldo ao falhar
    MIN_ROB_BALANCE: 100, // Saldo mínimo para ser roubado

    // Níveis
    XP_PER_LEVEL: 1000, // XP base por nível
    LEVEL_MULTIPLIER: 1.5, // Multiplicador de XP por nível
    MAX_LEVEL: 100, // Nível máximo

    // Jogos
    MIN_BET: 100, // Aposta mínima
    MAX_BET: 1000000, // Aposta máxima
    SLOTS_MULTIPLIERS: {
        TRIPLE_SEVEN: 10, // 777
        TRIPLE_DIAMOND: 7, // 💎💎💎
        TRIPLE_NORMAL: 5, // Três símbolos iguais
        DOUBLE: 2 // Dois símbolos iguais
    },
    ROULETTE_MULTIPLIERS: {
        GREEN: 14, // Verde (0)
        RED_BLACK: 2 // Vermelho ou Preto
    },

    // Loja
    SHOP_SELL_MULTIPLIER: 0.7, // 70% do preço original ao vender
    INVENTORY_MAX_ITEMS: 50 // Máximo de itens no inventário
}; 
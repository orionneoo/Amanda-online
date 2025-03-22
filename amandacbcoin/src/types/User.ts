import { SpecialItem, ItemEffect } from './index';

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

export interface User {
    // Campos de identificação
    user_id: string;
    group_id: string;
    name: string;

    // Campos de economia
    balance: number;
    
    // Timestamps de ações
    last_daily: Date;
    last_work: Date;
    last_rob: Date;
    last_mine: Date;
    last_fish: Date;
    
    // Contadores e resets
    mine_count: number;
    last_mine_reset: Date;
    rob_count: number;
    last_rob_reset: Date;
    fish_count: number;
    last_fish_reset: Date;
    
    // Inventário e progressão
    inventory: SpecialItem[];
    level: number;
    xp: number;
    
    // Habilidades
    skills: UserSkills;
    
    // Efeitos ativos
    effects: {
        xp_boost?: ItemEffect;
        work_multiplier?: ItemEffect;
        rob_chance?: ItemEffect;
    };
    
    // Conquistas
    achievements: string[];
    
    // Metadados
    created_at: Date;
    updated_at: Date;
} 
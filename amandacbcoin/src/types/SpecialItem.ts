export interface SpecialItem {
    id: string;
    name: string;
    description: string;
    effect: {
        type: 'xp_boost' | 'work_multiplier' | 'rob_chance';
        value: number;
        duration?: number;
    };
    activeUntil?: Date;
} 
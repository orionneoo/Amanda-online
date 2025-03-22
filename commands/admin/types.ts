import { CommandResponse as CBCoinCommandResponse } from '../../amandacbcoin/src';

export interface Stats {
    name: string;
    unique_users: number;
    total_messages: number;
    messages_last_24h: number;
    created_at: Date;
    last_interaction: Date;
    groups_active?: number;
}

export interface GroupSettings {
    group_id: string;
    welcome_message: string | null;
    auto_sticker: boolean;
    anti_link: boolean;
    anti_porn: boolean;
    max_warnings: number;
    created_at: Date;
    updated_at: Date;
}

// Re-exporta o tipo CommandResponse do CBCoin
export type CommandResponse = CBCoinCommandResponse; 
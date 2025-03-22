import { Database } from '../database/Database';
import { User, SpecialItem } from '../types';

interface ItemWithQuantity {
    item: SpecialItem;
    quantity: number;
    activeUntil?: Date;
}

export class InventoryManager {
    constructor(private database: Database) {}

    async showInventory(user: User): Promise<string> {
        if (!user.inventory || user.inventory.length === 0) {
            return '🎒 Seu inventário está vazio!';
        }

        // Agrupa itens e conta quantidades
        const groupedItems = new Map<string, ItemWithQuantity>();
        
        for (const item of user.inventory) {
            const existing = groupedItems.get(item.id);
            if (existing) {
                existing.quantity++;
            } else {
                groupedItems.set(item.id, {
                    item,
                    quantity: 1,
                    activeUntil: item.activeUntil
                });
            }
        }

        const items = Array.from(groupedItems.values())
            .map(({ item, quantity, activeUntil }) => {
                let text = `${item.name} (x${quantity})\n📝 ${item.description}`;
                if (activeUntil && activeUntil > new Date()) {
                    const timeLeft = this.formatTimeLeft(activeUntil);
                    text += `\n⏳ Ativo por mais ${timeLeft}`;
                }
                return text;
            }).join('\n\n');

        return `🎒 *SEU INVENTÁRIO*\n\n${items}\n\nUse !usar <nome> para usar um item.`;
    }

    async useItem(user: User, itemName: string): Promise<string> {
        if (!user.inventory || user.inventory.length === 0) {
            return '❌ Você não tem nenhum item no inventário!';
        }

        // Normaliza o nome do item
        const searchName = itemName.toLowerCase().trim();
        
        // Encontra o item no inventário
        const itemIndex = user.inventory.findIndex(item => 
            item.id.toLowerCase() === searchName ||
            item.name.toLowerCase().includes(searchName)
        );

        if (itemIndex === -1) {
            return '❌ Item não encontrado no seu inventário!';
        }

        const item = user.inventory[itemIndex];
        const now = new Date();
        let duration: number;

        // Define duração baseada no tipo do item
        switch (item.id) {
            case 'escudo':
                duration = 24 * 60 * 60 * 1000; // 24 horas
                break;
            case 'estrela':
            case 'cristal':
                duration = 5 * 60 * 60 * 1000; // 5 horas
                break;
            default:
                duration = 1 * 60 * 60 * 1000; // 1 hora (padrão)
        }

        // Remove o item usado do inventário
        user.inventory.splice(itemIndex, 1);

        // Aplica o efeito do item
        let effectMessage = '';
        const currentSkills = { ...user.skills };
        const activeUntil = new Date(now.getTime() + duration);

        switch (item.effect.type) {
            case 'xp_boost':
                currentSkills.xp_boost *= item.effect.value;
                effectMessage = `Seu ganho de XP foi aumentado em ${item.effect.value}x por ${this.formatDuration(duration)}!`;
                break;
            case 'work_multiplier':
                currentSkills.work_multiplier *= item.effect.value;
                effectMessage = `Seu multiplicador de trabalho foi aumentado em ${item.effect.value}x por ${this.formatDuration(duration)}!`;
                break;
            case 'rob_chance':
                if (item.effect.value === -1) {
                    currentSkills.rob_chance = -1; // Imunidade total
                    effectMessage = `Você está protegido contra roubos por ${this.formatDuration(duration)}!`;
                } else {
                    currentSkills.rob_chance += item.effect.value;
                    effectMessage = `Sua chance de roubo foi aumentada em ${item.effect.value * 100}% por ${this.formatDuration(duration)}!`;
                }
                break;
        }

        // Atualiza o usuário com os novos efeitos e duração
        await this.database.updateUser(user.user_id, user.group_id, {
            inventory: user.inventory,
            skills: currentSkills,
            [`effects.${item.effect.type}`]: {
                value: item.effect.value,
                activeUntil
            }
        });

        return `✨ Você usou ${item.name}!\n${effectMessage}`;
    }

    private formatTimeLeft(endTime: Date): string {
        const now = new Date();
        const diff = endTime.getTime() - now.getTime();
        return this.formatDuration(diff);
    }

    private formatDuration(milliseconds: number): string {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
        } else {
            return `${minutes}m`;
        }
    }
} 
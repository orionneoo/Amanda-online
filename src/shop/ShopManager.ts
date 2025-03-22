import { Database } from '../../amandacbcoin/src/database/Database';
import { User, ShopItem } from '../../amandacbcoin/src/types';

const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'estrela',
        name: '⭐ Estrela Mágica',
        emoji: '⭐',
        description: 'Aumenta seu multiplicador de trabalho em 1.5x',
        price: 15000,
        available: true,
        keywords: ['estrela', 'star', 'magica', 'trabalho'],
        effect: {
            type: 'work_multiplier',
            value: 1.5
        }
    },
    {
        id: 'cristal',
        name: '💎 Cristal Místico',
        emoji: '💎',
        description: 'Aumenta sua chance de roubo em 0.2',
        price: 20000,
        available: true,
        keywords: ['cristal', 'crystal', 'mistico', 'roubo'],
        effect: {
            type: 'rob_chance',
            value: 0.2
        }
    },
    {
        id: 'escudo',
        name: '🛡️ Escudo Protetor',
        emoji: '🛡️',
        description: 'Protege contra roubos por 24h',
        price: 25000,
        available: true,
        keywords: ['escudo', 'shield', 'protetor', 'protecao'],
        effect: {
            type: 'rob_chance',
            value: -1,
            duration: 24 * 60 * 60 * 1000 // 24 horas
        }
    },
    {
        id: 'amuleto',
        name: '🍀 Amuleto da Sorte',
        emoji: '🍀',
        description: 'Aumenta seu ganho de XP em 1.5x',
        price: 15000,
        available: true,
        keywords: ['amuleto', 'sorte', 'lucky', 'xp'],
        effect: {
            type: 'xp_boost',
            value: 1.5
        }
    },
    {
        id: 'vara_iniciante',
        name: '🎣 Vara de Iniciante',
        emoji: '🎣',
        description: 'Uma vara básica para começar sua jornada de pescador',
        price: 1000,
        available: true,
        keywords: ['vara', 'pesca', 'iniciante', 'fishing'],
        minLevel: 1,
        effect: {
            type: 'fishing',
            value: 1
        }
    },
    {
        id: 'vara_profissional',
        name: '🎣 Vara Profissional',
        emoji: '🎣',
        description: 'Uma vara resistente com maior chance de peixes raros',
        price: 5000,
        available: true,
        keywords: ['vara', 'pesca', 'profissional', 'pro'],
        minLevel: 5,
        effect: {
            type: 'fishing',
            value: 1.5
        }
    },
    {
        id: 'vara_mestre',
        name: '🎣 Vara do Mestre',
        emoji: '🎣',
        description: 'A melhor vara de pesca disponível',
        price: 15000,
        available: true,
        keywords: ['vara', 'pesca', 'mestre', 'master'],
        minLevel: 10,
        effect: {
            type: 'fishing',
            value: 2
        }
    }
];

export class ShopManager {
    constructor(private database: Database) {}

    async showShop(): Promise<string> {
        const items = SHOP_ITEMS
            .filter(item => item.available)
            .map(item => {
                return `${item.name} (ID: ${item.id})\n💵 Preço: ${item.price} CBCoins\n📝 ${item.description}`;
            }).join('\n\n');

        return `🏪 *LOJA CBCOIN*\n\n${items}\n\n*Como comprar:*\n!comprar estrela - Compra ⭐ Estrela Mágica (15,000)\n!comprar cristal - Compra 💎 Cristal Místico (20,000)\n!comprar escudo - Compra 🛡️ Escudo Protetor (25,000)\n\n💡 Use o comando !comprar seguido do ID do item.`;
    }

    private findItem(searchTerm: string): ShopItem | null {
        if (!searchTerm) return null;

        // Pega apenas a primeira palavra do termo de busca
        const firstWord = searchTerm.split(' ')[0].toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        // Procura por correspondência exata primeiro
        let item = SHOP_ITEMS.find(i => 
            i.id === firstWord || 
            i.name.toLowerCase().includes(firstWord)
        );

        // Se não encontrar, procura por palavras-chave
        if (!item) {
            item = SHOP_ITEMS.find(i => 
                i.keywords.some(keyword => 
                    keyword === firstWord || 
                    firstWord === keyword
                )
            );
        }

        return item || null;
    }

    async buyItem(user: User, itemName: string): Promise<string> {
        if (!itemName) {
            return '❌ Use o comando com o nome do item que deseja comprar!\n\n*Comandos disponíveis:*\n!comprar estrela\n!comprar cristal\n!comprar escudo';
        }

        const searchName = itemName.trim();
        const item = this.findItem(searchName);

        if (!item || !item.available) {
            return `❌ Item não encontrado!\n\n*Use exatamente um destes comandos:*\n!comprar estrela\n!comprar cristal\n!comprar escudo\n\nUse !loja para ver mais detalhes.`;
        }

        if (item.minLevel && user.level < item.minLevel) {
            return `❌ Você precisa ser nível ${item.minLevel} para comprar ${item.name}!`;
        }

        if (user.balance < item.price) {
            const missing = item.price - user.balance;
            return `❌ CBCoins insuficientes para comprar ${item.name}!\n\n💰 Seu saldo: ${user.balance}\n💵 Preço: ${item.price}\n⚠️ Faltam: ${missing} CBCoins`;
        }

        if (!user.inventory) user.inventory = [];
        user.inventory.push(item);

        await this.database.updateUser(user.user_id, user.group_id, {
            balance: user.balance - item.price,
            inventory: user.inventory
        });

        return `✅ Compra realizada com sucesso!\n\n${item.name}\n💵 Preço: ${item.price} CBCoins\n📝 ${item.description}\n\nUse !inventario para ver seus itens.`;
    }
} 
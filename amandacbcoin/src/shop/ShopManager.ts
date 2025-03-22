import { ShopItem } from '../types';

export const SHOP_ITEMS: ShopItem[] = [
    // ... existing code ...
    {
        id: 'vara_iniciante',
        name: 'Vara de Pesca Iniciante',
        emoji: '🎣',
        description: 'Uma vara de pesca básica para começar sua jornada como pescador',
        price: 1000,
        available: true,
        minLevel: 1,
        keywords: ['vara', 'pesca', 'iniciante'],
        effect: {
            type: 'fishing',
            value: 1
        }
    },
    {
        id: 'vara_profissional',
        name: 'Vara de Pesca Profissional',
        emoji: '🎣',
        description: 'Uma vara de pesca de qualidade superior que aumenta suas chances de pegar peixes raros',
        price: 5000,
        available: true,
        minLevel: 5,
        keywords: ['vara', 'pesca', 'profissional'],
        effect: {
            type: 'fishing',
            value: 1.5
        }
    },
    {
        id: 'vara_mestre',
        name: 'Vara de Pesca do Mestre',
        emoji: '🎣',
        description: 'A melhor vara de pesca disponível, perfeita para pescadores experientes',
        price: 15000,
        available: true,
        minLevel: 10,
        keywords: ['vara', 'pesca', 'mestre'],
        effect: {
            type: 'fishing',
            value: 2
        }
    }
]; 
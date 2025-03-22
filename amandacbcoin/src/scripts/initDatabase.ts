import { MongoClient, IndexDescription } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

async function initDatabase() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI não encontrada no arquivo .env');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('📦 Conectado ao MongoDB Atlas');

        const db = client.db('AmandaeCBcoin');

        // Lista de coleções necessárias e seus índices
        const collections = [
            {
                name: 'cbcoin_users',
                indexes: [
                    { key: { "user_id": 1 }, unique: true },
                    { key: { "balance": -1 } },
                    { key: { "level": -1 } },
                    { key: { "last_daily": 1 } },
                    { key: { "last_work": 1 } },
                    { key: { "last_rob": 1 } },
                    { key: { "created_at": 1 } },
                    { key: { "updated_at": 1 } }
                ] as IndexDescription[]
            },
            {
                name: 'transactions',
                indexes: [
                    { key: { "transaction_id": 1 }, unique: true },
                    { key: { "user_id": 1 } },
                    { key: { "type": 1 } },
                    { key: { "created_at": 1 } }
                ] as IndexDescription[]
            },
            {
                name: 'items',
                indexes: [
                    { key: { "item_id": 1 }, unique: true },
                    { key: { "type": 1 } },
                    { key: { "rarity": 1 } },
                    { key: { "price": 1 } }
                ] as IndexDescription[]
            },
            {
                name: 'user_inventory',
                indexes: [
                    { key: { "user_id": 1, "item_id": 1 }, unique: true },
                    { key: { "user_id": 1 } },
                    { key: { "item_id": 1 } }
                ] as IndexDescription[]
            },
            {
                name: 'achievements',
                indexes: [
                    { key: { "achievement_id": 1 }, unique: true },
                    { key: { "type": 1 } },
                    { key: { "difficulty": 1 } }
                ] as IndexDescription[]
            },
            {
                name: 'user_achievements',
                indexes: [
                    { key: { "user_id": 1, "achievement_id": 1 }, unique: true },
                    { key: { "user_id": 1 } },
                    { key: { "achievement_id": 1 } },
                    { key: { "completed_at": 1 } }
                ] as IndexDescription[]
            }
        ];

        // Criar coleções e índices
        for (const collection of collections) {
            console.log(`\n🔧 Configurando coleção: ${collection.name}`);
            
            // Criar coleção se não existir
            if (!(await db.listCollections({ name: collection.name }).toArray()).length) {
                await db.createCollection(collection.name);
                console.log(`✅ Coleção ${collection.name} criada`);
            } else {
                console.log(`ℹ️ Coleção ${collection.name} já existe`);
            }

            // Criar índices
            const col = db.collection(collection.name);
            await col.createIndexes(collection.indexes);
            console.log(`✅ Índices criados para ${collection.name}`);
        }

        // Inserir itens padrão se a coleção estiver vazia
        const items = db.collection('items');
        if (await items.countDocuments() === 0) {
            const defaultItems = [
                {
                    item_id: 'fishing_rod',
                    name: 'Vara de Pesca',
                    type: 'tool',
                    rarity: 'common',
                    price: 1000,
                    description: 'Uma vara de pesca básica para pescar peixes',
                    effects: {
                        fishing_bonus: 1.1
                    }
                },
                {
                    item_id: 'pickaxe',
                    name: 'Picareta',
                    type: 'tool',
                    rarity: 'common',
                    price: 1000,
                    description: 'Uma picareta básica para minerar',
                    effects: {
                        mining_bonus: 1.1
                    }
                },
                {
                    item_id: 'lucky_coin',
                    name: 'Moeda da Sorte',
                    type: 'accessory',
                    rarity: 'rare',
                    price: 5000,
                    description: 'Aumenta suas chances de ganhar em jogos de azar',
                    effects: {
                        gambling_bonus: 1.2
                    }
                }
            ];

            await items.insertMany(defaultItems);
            console.log('✅ Itens padrão inseridos');
        }

        // Inserir conquistas padrão se a coleção estiver vazia
        const achievements = db.collection('achievements');
        if (await achievements.countDocuments() === 0) {
            const defaultAchievements = [
                {
                    achievement_id: 'first_million',
                    name: 'Primeiro Milhão',
                    description: 'Acumule 1.000.000 CBCoins',
                    type: 'balance',
                    difficulty: 'hard',
                    reward: {
                        coins: 100000,
                        xp: 5000
                    },
                    criteria: {
                        balance: 1000000
                    }
                },
                {
                    achievement_id: 'work_100',
                    name: 'Trabalhador Dedicado',
                    description: 'Trabalhe 100 vezes',
                    type: 'work',
                    difficulty: 'medium',
                    reward: {
                        coins: 10000,
                        xp: 1000
                    },
                    criteria: {
                        work_count: 100
                    }
                },
                {
                    achievement_id: 'daily_30',
                    name: 'Assiduidade',
                    description: 'Colete recompensa diária por 30 dias',
                    type: 'daily',
                    difficulty: 'medium',
                    reward: {
                        coins: 15000,
                        xp: 2000
                    },
                    criteria: {
                        daily_count: 30
                    }
                }
            ];

            await achievements.insertMany(defaultAchievements);
            console.log('✅ Conquistas padrão inseridas');
        }

        console.log('\n✅ Inicialização do banco de dados concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro durante a inicialização do banco de dados:', error);
    } finally {
        await client.close();
        console.log('🔌 Conexão fechada');
    }
}

initDatabase().catch(console.error); 
import { MongoClient, Collection } from 'mongodb';
import { User, UserSkills, SpecialItem, Transfer, Bank } from '../types';

export class Database {
    private client: MongoClient;
    private users!: Collection<User>;
    private transfers!: Collection<Transfer>;
    private banks!: Collection<Bank>;

    constructor(private mongoUri: string) {
        this.client = new MongoClient(mongoUri);
    }

    async connect(): Promise<void> {
        try {
            await this.client.connect();
            console.log('✅ Conectado ao MongoDB Atlas');

            const db = this.client.db('AmandaeCBcoin');
            
            // Inicializa as coleções
            this.users = db.collection('users');
            this.transfers = db.collection('transfers');
            this.banks = db.collection('banks');

            // Cria índices
            await this.createIndexes();
            
            console.log('✅ Índices criados com sucesso');
        } catch (error) {
            console.error('❌ Erro ao conectar ao MongoDB:', error);
            throw error;
        }
    }

    private async createIndexes(): Promise<void> {
        // Índices para usuários
        await this.users.createIndex({ user_id: 1, group_id: 1 }, { unique: true });
        await this.users.createIndex({ group_id: 1, balance: -1 });
        await this.users.createIndex({ group_id: 1, level: -1 });

        // Índices para transferências
        await this.transfers.createIndex({ sender_id: 1, created_at: -1 });
        await this.transfers.createIndex({ receiver_id: 1, created_at: -1 });

        // Índices para bancos
        await this.banks.createIndex({ group_id: 1 }, { unique: true });
    }

    async disconnect(): Promise<void> {
        await this.client.close();
    }

    async getUser(user_id: string, group_id: string, userName?: string): Promise<User> {
        const user = await this.users.findOne({ user_id, group_id });

        if (user) {
            // Atualiza o nome se mudou
            if (userName && user.name !== userName) {
                await this.users.updateOne(
                    { user_id, group_id },
                    { $set: { name: userName } }
                );
                user.name = userName;
            }
            return user;
        }

        // Cria novo usuário se não existir
        const newUser: User = {
            user_id,
            group_id,
            name: userName || 'Usuário',
            balance: 0,
            xp: 0,
            level: 1,
            inventory: [],
            skills: {
                farming: 1,
                mining: 1,
                fishing: 1,
                trading: 1,
                gambling: 1,
                xp_boost: 1,
                work_multiplier: 1,
                rob_chance: 1
            },
            achievements: [],
            last_work: new Date(0),
            last_daily: new Date(0),
            last_rob: new Date(0),
            last_rob_reset: new Date(0),
            rob_count: 0,
            last_mine: new Date(0),
            last_mine_reset: new Date(0),
            mine_count: 0,
            last_fish: new Date(0),
            last_fish_reset: new Date(0),
            fish_count: 0,
            last_plant: new Date(0),
            last_harvest: new Date(0),
            crops: [],
            effects: {},
            created_at: new Date(),
            updated_at: new Date()
        };

        await this.users.insertOne(newUser);
        return newUser;
    }

    async updateUser(user_id: string, group_id: string, update: Partial<User>): Promise<void> {
        await this.users.updateOne(
            { user_id, group_id },
            { 
                $set: {
                    ...update,
                    updated_at: new Date()
                }
            }
        );
    }

    async getTopUsers(group_id: string): Promise<User[]> {
        return await this.users
            .find({ group_id })
            .sort({ balance: -1 })
            .limit(10)
            .toArray();
    }

    async addToInventory(userId: string, groupId: string, item: SpecialItem): Promise<void> {
        await this.users.updateOne(
            { user_id: userId, group_id: groupId },
            { 
                $push: { inventory: item },
                $set: { updated_at: new Date() }
            }
        );
    }

    async removeFromInventory(userId: string, groupId: string, itemId: string): Promise<void> {
        await this.users.updateOne(
            { user_id: userId, group_id: groupId },
            { 
                $pull: { inventory: { id: itemId } },
                $set: { updated_at: new Date() }
            }
        );
    }

    async updateSkills(userId: string, groupId: string, skills: Partial<UserSkills>): Promise<void> {
        const update: { [key: string]: number } = {};
        for (const [skill, value] of Object.entries(skills)) {
            update[`skills.${skill}`] = value;
        }

        await this.users.updateOne(
            { user_id: userId, group_id: groupId },
            { 
                $set: {
                    ...update,
                    updated_at: new Date()
                }
            }
        );
    }

    async addAchievement(userId: string, groupId: string, achievement: string): Promise<void> {
        await this.users.updateOne(
            { user_id: userId, group_id: groupId },
            { 
                $addToSet: { achievements: achievement },
                $set: { updated_at: new Date() }
            }
        );
    }

    async getDailyTransfers(userId: string, date: Date): Promise<Transfer[]> {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        return await this.transfers
            .find({
                sender_id: userId,
                created_at: {
                    $gte: date,
                    $lt: nextDay
                }
            })
            .toArray();
    }

    async addTransfer(transfer: Transfer): Promise<void> {
        await this.transfers.insertOne(transfer);
    }

    async getBank(group_id: string): Promise<Bank> {
        const bank = await this.banks.findOne({ group_id });
        
        if (bank) {
            return bank;
        }

        // Cria novo banco se não existir
        const newBank: Bank = {
            group_id,
            balance: 0,
            total_tax_collected: 0,
            total_transfers: 0,
            created_at: new Date(),
            updated_at: new Date()
        };

        await this.banks.insertOne(newBank);
        return newBank;
    }

    async updateBank(group_id: string, tax: number): Promise<void> {
        await this.banks.updateOne(
            { group_id },
            {
                $inc: {
                    balance: tax,
                    total_tax_collected: tax,
                    total_transfers: 1
                },
                $set: { updated_at: new Date() }
            },
            { upsert: true }
        );
    }
} 
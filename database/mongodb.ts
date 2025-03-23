import { MongoClient, Db, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

class MongoDBManager {
    private static instance: MongoDBManager;
    private client: MongoClient;
    private db: Db;
    private isConnected: boolean = false;

    private constructor() {
        const uri = process.env.MONGODB_URI || 'mongodb+srv://your-connection-string';
        this.client = new MongoClient(uri);
    }

    public static getInstance(): MongoDBManager {
        if (!MongoDBManager.instance) {
            MongoDBManager.instance = new MongoDBManager();
        }
        return MongoDBManager.instance;
    }

    public async connect(): Promise<void> {
        if (!this.isConnected) {
            try {
                await this.client.connect();
                this.db = this.client.db('AmandaeCBcoin');
                this.isConnected = true;
                console.log('📦 Conectado ao MongoDB Atlas com sucesso!');

                // Cria índices necessários
                await this.createIndexes();
            } catch (error) {
                console.error('❌ Erro ao conectar ao MongoDB:', error);
                throw error;
            }
        }
    }

    private async createIndexes(): Promise<void> {
        try {
            // Índices para CBCoin
            const cbcoinUsers = this.db.collection('cbcoin_users');
            await cbcoinUsers.createIndexes([
                { key: { user_id: 1 }, unique: true },
                { key: { balance: -1 } },
                { key: { level: -1 } },
                { key: { last_daily: 1 } },
                { key: { last_work: 1 } },
                { key: { last_rob: 1 } },
                { key: { created_at: 1 } },
                { key: { updated_at: 1 } }
            ]);

            // Índices para grupos
            const groups = this.db.collection('groups');
            await groups.createIndexes([
                { key: { id: 1 }, unique: true },
                { key: { active: 1 } },
                { key: { created_at: 1 } },
                { key: { updated_at: 1 } }
            ]);

            // Índices para relação usuário-grupo
            const userGroups = this.db.collection('user_groups');
            await userGroups.createIndexes([
                { key: { user_id: 1, group_id: 1 }, unique: true },
                { key: { user_id: 1 } },
                { key: { group_id: 1 } },
                { key: { created_at: 1 } },
                { key: { updated_at: 1 } }
            ]);

            // Índices para mensagens
            const messages = this.db.collection('messages');
            await messages.createIndexes([
                { key: { id: 1 }, unique: true },
                { key: { user_id: 1 } },
                { key: { group_id: 1 } },
                { key: { created_at: 1 } },
                { key: { type: 1 } }
            ]);

            console.log('✅ Índices criados/verificados com sucesso');
        } catch (error) {
            console.error('❌ Erro ao criar índices:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.isConnected) {
            try {
                await this.client.close();
                this.isConnected = false;
                console.log('📦 Desconectado do MongoDB Atlas');
            } catch (error) {
                console.error('❌ Erro ao desconectar do MongoDB:', error);
                throw error;
            }
        }
    }

    // Novo método para obter ou criar usuário
    public async getOrCreateUser(userId: string, name: string, collection: string): Promise<any> {
        await this.connect();
        const users = this.db.collection(collection);
        
        let user = await users.findOne({ user_id: userId });
        
        if (!user) {
            user = {
                _id: new ObjectId(),
                user_id: userId,
                name: name,
                balance: 0,
                last_daily: new Date(0),
                last_work: new Date(0),
                last_rob: new Date(0),
                inventory: [],
                level: 1,
                xp: 0,
                skills: {
                    farming: 1,
                    mining: 1,
                    fishing: 1,
                    trading: 1,
                    gambling: 1
                },
                achievements: [],
                created_at: new Date(),
                updated_at: new Date()
            };

            try {
                await users.insertOne(user);
                console.log(`✅ Novo usuário CBCoin criado: ${name} (${userId})`);
            } catch (error) {
                if ((error as any).code === 11000) {
                    console.log(`⚠️ Conflito ao criar usuário CBCoin, tentando recuperar: ${userId}`);
                    const existingUser = await users.findOne({ user_id: userId });
                    if (existingUser) {
                        return existingUser;
                    }
                }
                throw error;
            }
        }
        
        return user;
    }

    // Novo método para atualizar usuário
    public async updateUser(userId: string, update: any, collection: string): Promise<void> {
        await this.connect();
        const users = this.db.collection(collection);
        
        try {
            const result = await users.updateOne(
                { user_id: userId },
                { 
                    $set: {
                        ...update,
                        updated_at: new Date()
                    }
                }
            );

            if (result.matchedCount === 0) {
                console.warn(`⚠️ Usuário CBCoin não encontrado para atualização: ${userId}`);
            } else {
                console.log(`✅ Usuário CBCoin atualizado: ${userId}`);
                console.log('Dados atualizados:', update);
            }
        } catch (error) {
            console.error(`❌ Erro ao atualizar usuário CBCoin ${userId}:`, error);
            throw error;
        }
    }

    // Novo método para obter top usuários
    public async getTopUsers(limit: number, collection: string): Promise<any[]> {
        await this.connect();
        const users = this.db.collection(collection);
        
        try {
            const topUsers = await users.find()
                .sort({ balance: -1 })
                .limit(limit)
                .toArray();
            
            console.log(`✅ Top ${limit} usuários CBCoin recuperados`);
            return topUsers;
        } catch (error) {
            console.error('❌ Erro ao buscar ranking CBCoin:', error);
            return [];
        }
    }

    // Métodos para grupos
    public async addGroup(groupData: any): Promise<void> {
        await this.connect();
        const groups = this.db.collection('groups');
        try {
            await groups.updateOne(
                { id: groupData.id },
                { 
                    $set: { 
                        ...groupData,
                        updated_at: new Date(),
                        created_at: groupData.created_at || new Date()
                    }
                },
                { upsert: true }
            );
            console.log(`✅ Grupo ${groupData.name || groupData.id} atualizado/criado`);
        } catch (error) {
            console.error('❌ Erro ao adicionar/atualizar grupo:', error);
            throw error;
        }
    }

    public async listActiveGroups(): Promise<any[]> {
        await this.connect();
        const groups = this.db.collection('groups');
        try {
            const activeGroups = await groups.find({ active: true }).toArray();
            console.log(`✅ ${activeGroups.length} grupos ativos encontrados`);
            return activeGroups;
        } catch (error) {
            console.error('❌ Erro ao listar grupos ativos:', error);
            return [];
        }
    }

    public async listInactiveGroups(): Promise<any[]> {
        await this.connect();
        const groups = this.db.collection('groups');
        try {
            const inactiveGroups = await groups.find({ active: false }).toArray();
            console.log(`✅ ${inactiveGroups.length} grupos inativos encontrados`);
            return inactiveGroups;
        } catch (error) {
            console.error('❌ Erro ao listar grupos inativos:', error);
            return [];
        }
    }

    // Métodos para usuários em grupos
    public async addUserToGroup(userData: any): Promise<void> {
        await this.connect();
        const userGroups = this.db.collection('user_groups');
        try {
            await userGroups.updateOne(
                { 
                    user_id: userData.user_id,
                    group_id: userData.group_id
                },
                { 
                    $set: { 
                        ...userData,
                        updated_at: new Date(),
                        created_at: userData.created_at || new Date()
                    }
                },
                { upsert: true }
            );
            console.log(`✅ Usuário ${userData.user_name} adicionado/atualizado no grupo ${userData.group_name}`);
        } catch (error) {
            console.error('❌ Erro ao adicionar usuário ao grupo:', error);
            throw error;
        }
    }

    public async listAllUsersAndGroups(): Promise<any[]> {
        await this.connect();
        const userGroups = this.db.collection('user_groups');
        try {
            const users = await userGroups.aggregate([
                {
                    $group: {
                        _id: "$user_id",
                        name: { $first: "$user_name" },
                        phone_number: { $first: "$phone_number" },
                        groups: { $push: "$group_name" },
                        group_count: { $sum: 1 }
                    }
                }
            ]).toArray();
            console.log(`✅ Lista de ${users.length} usuários e seus grupos recuperada`);
            return users;
        } catch (error) {
            console.error('❌ Erro ao listar usuários e grupos:', error);
            return [];
        }
    }

    // Métodos para mensagens
    public async addMessage(messageData: any): Promise<void> {
        await this.connect();
        const messages = this.db.collection('messages');
        try {
            await messages.updateOne(
                { id: messageData.id },
                { 
                    $set: {
                        ...messageData,
                        created_at: new Date()
                    }
                },
                { upsert: true }
            );
            console.log(`✅ Mensagem ${messageData.id} salva com sucesso`);
        } catch (error) {
            console.error('❌ Erro ao salvar mensagem:', error);
            throw error;
        }
    }

    // Métodos para estatísticas
    public async getGroupStats(groupId: string): Promise<any> {
        await this.connect();
        try {
            const messages = this.db.collection('messages');
            const groups = this.db.collection('groups');
            const userGroups = this.db.collection('user_groups');

            const group = await groups.findOne({ id: groupId });
            const uniqueUsers = await userGroups.distinct('user_id', { group_id: groupId });
            const totalMessages = await messages.countDocuments({ group_id: groupId });
            const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const messages24h = await messages.countDocuments({
                group_id: groupId,
                created_at: { $gte: last24h }
            });

            const stats = {
                name: group?.name || 'Grupo',
                unique_users: uniqueUsers.length,
                total_messages: totalMessages,
                messages_last_24h: messages24h,
                created_at: group?.created_at || new Date(),
                last_interaction: group?.updated_at || new Date()
            };

            console.log(`✅ Estatísticas do grupo ${groupId} recuperadas`);
            return stats;
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas do grupo:', error);
            throw error;
        }
    }

    public async getUserStats(userId: string): Promise<any> {
        await this.connect();
        try {
            const messages = this.db.collection('messages');
            const userGroups = this.db.collection('user_groups');

            const user = await userGroups.findOne({ user_id: userId });
            const activeGroups = await userGroups.countDocuments({ user_id: userId });
            const totalMessages = await messages.countDocuments({ user_id: userId });
            const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const messages24h = await messages.countDocuments({
                user_id: userId,
                created_at: { $gte: last24h }
            });

            const stats = {
                name: user?.user_name || 'Usuário',
                total_messages: totalMessages,
                messages_last_24h: messages24h,
                groups_active: activeGroups,
                created_at: user?.created_at || new Date(),
                last_interaction: user?.updated_at || new Date()
            };

            console.log(`✅ Estatísticas do usuário ${userId} recuperadas`);
            return stats;
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas do usuário:', error);
            throw error;
        }
    }

    public async getMessagesByGroup(groupId: string, since: Date): Promise<any[]> {
        await this.connect();
        const messages = this.db.collection('messages');
        try {
            const groupMessages = await messages.find({
                group_id: groupId,
                created_at: { $gte: since }
            })
            .sort({ created_at: 1 })
            .toArray();
            
            console.log(`✅ ${groupMessages.length} mensagens encontradas para o grupo ${groupId}`);
            return groupMessages;
        } catch (error) {
            console.error('❌ Erro ao buscar mensagens do grupo:', error);
            return [];
        }
    }

    public async getGroupInfo(groupId: string): Promise<any> {
        await this.connect();
        const groups = this.db.collection('groups');
        try {
            const groupInfo = await groups.findOne({ id: groupId });
            if (!groupInfo) {
                console.log(`⚠️ Grupo ${groupId} não encontrado no banco de dados`);
                return {
                    name: 'Grupo',
                    member_count: 0,
                    admins: []
                };
            }
            console.log(`✅ Informações do grupo ${groupId} recuperadas`);
            return groupInfo;
        } catch (error) {
            console.error('❌ Erro ao buscar informações do grupo:', error);
            return {
                name: 'Grupo',
                member_count: 0,
                admins: []
            };
        }
    }
}

export default MongoDBManager.getInstance(); 
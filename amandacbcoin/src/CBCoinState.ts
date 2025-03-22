import { MongoClient, Collection } from 'mongodb';

interface GroupState {
    group_id: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export class CBCoinState {
    private client: MongoClient;
    private collection!: Collection<GroupState>;
    private activeGroups: Set<string> = new Set();

    constructor(private uri: string) {
        this.client = new MongoClient(uri);
    }

    async connect(): Promise<void> {
        try {
            await this.client.connect();
            const db = this.client.db('AmandaeCBcoin');
            this.collection = db.collection('group_states');
            
            // Criar índice único para group_id
            await this.collection.createIndex({ group_id: 1 }, { unique: true });
            
            // Carregar grupos ativos
            const activeGroups = await this.collection.find({ is_active: true }).toArray();
            activeGroups.forEach(group => this.activeGroups.add(group.group_id));
            
            console.log('✅ CBCoinState inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao conectar CBCoinState:', error);
            throw error;
        }
    }

    async openCBCoin(groupId: string): Promise<string> {
        try {
            if (this.activeGroups.has(groupId)) {
                return '❌ O CBCoin já está ativo neste grupo!';
            }

            await this.collection.updateOne(
                { group_id: groupId },
                {
                    $set: {
                        is_active: true,
                        updated_at: new Date()
                    },
                    $setOnInsert: {
                        created_at: new Date()
                    }
                },
                { upsert: true }
            );

            this.activeGroups.add(groupId);
            return '✅ CBCoin ativado com sucesso neste grupo!';
        } catch (error) {
            console.error('Erro ao abrir CBCoin:', error);
            return '❌ Erro ao ativar CBCoin. Tente novamente.';
        }
    }

    async closeCBCoin(groupId: string): Promise<string> {
        try {
            if (!this.activeGroups.has(groupId)) {
                return '❌ O CBCoin já está desativado neste grupo!';
            }

            await this.collection.updateOne(
                { group_id: groupId },
                {
                    $set: {
                        is_active: false,
                        updated_at: new Date()
                    }
                }
            );

            this.activeGroups.delete(groupId);
            return '✅ CBCoin desativado com sucesso neste grupo!';
        } catch (error) {
            console.error('Erro ao fechar CBCoin:', error);
            return '❌ Erro ao desativar CBCoin. Tente novamente.';
        }
    }

    isActive(groupId: string): boolean {
        return this.activeGroups.has(groupId);
    }

    async disconnect(): Promise<void> {
        await this.client.close();
    }
} 
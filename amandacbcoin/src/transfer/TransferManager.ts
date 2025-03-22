import { Database } from '../database/Database';
import { User } from '../types';

export class TransferManager {
    private readonly MIN_TRANSFER = 100; // Mínimo de 100 CBCoins
    private readonly MAX_TRANSFER = 1000000; // Máximo de 1M CBCoins
    private readonly DAILY_TRANSFER_LIMIT = 5000000; // Limite diário de 5M CBCoins
    private readonly TRANSFER_TAX = 0.05; // 5% de taxa

    constructor(private database: Database) {}

    async transfer(
        sender: User,
        receiverId: string,
        amount: number
    ): Promise<{ text: string; mentions: string[] }> {
        try {
            // Validações básicas
            if (amount < this.MIN_TRANSFER) {
                return {
                    text: `❌ O valor mínimo para transferência é ${this.MIN_TRANSFER} CBCoins!`,
                    mentions: [sender.user_id]
                };
            }

            if (amount > this.MAX_TRANSFER) {
                return {
                    text: `❌ O valor máximo para transferência é ${this.MAX_TRANSFER} CBCoins!`,
                    mentions: [sender.user_id]
                };
            }

            if (sender.balance < amount) {
                return {
                    text: `❌ Você não tem CBCoins suficientes!\n\n💰 Seu saldo: ${sender.balance} CBCoins`,
                    mentions: [sender.user_id]
                };
            }

            // Verifica limite diário
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const transfers = await this.database.getDailyTransfers(sender.user_id, today);
            const totalTransferred = transfers.reduce((sum, t) => sum + t.amount, 0);

            if (totalTransferred + amount > this.DAILY_TRANSFER_LIMIT) {
                return {
                    text: `❌ Você atingiu o limite diário de transferências (${this.DAILY_TRANSFER_LIMIT} CBCoins)!\n\n💰 Transferido hoje: ${totalTransferred} CBCoins`,
                    mentions: [sender.user_id]
                };
            }

            // Busca o receptor
            const receiver = await this.database.getUser(receiverId, sender.group_id);
            if (!receiver) {
                return {
                    text: '❌ Usuário não encontrado!',
                    mentions: [sender.user_id]
                };
            }

            // Calcula taxa
            const tax = Math.floor(amount * this.TRANSFER_TAX);
            const finalAmount = amount - tax;

            // Atualiza saldos
            await this.database.updateUser(sender.user_id, sender.group_id, {
                balance: sender.balance - amount
            });

            await this.database.updateUser(receiver.user_id, receiver.group_id, {
                balance: receiver.balance + finalAmount
            });

            // Registra a transferência
            await this.database.addTransfer({
                sender_id: sender.user_id,
                receiver_id: receiver.user_id,
                amount: amount,
                tax: tax,
                created_at: new Date()
            });

            // Atualiza o banco com a taxa
            await this.database.updateBank(sender.group_id, tax);

            return {
                text: `✅ Transferência realizada com sucesso!\n\n` +
                      `💸 Valor: ${amount} CBCoins\n` +
                      `📊 Taxa (5%): ${tax} CBCoins\n` +
                      `💰 Valor recebido: ${finalAmount} CBCoins\n\n` +
                      `De: @${sender.user_id.split('@')[0]}\n` +
                      `Para: @${receiver.user_id.split('@')[0]}\n\n` +
                      `🏦 A taxa foi depositada no banco do grupo.\n` +
                      `Use !banco para ver o status do banco.`,
                mentions: [sender.user_id, receiver.user_id]
            };

        } catch (error) {
            console.error('Erro ao realizar transferência:', error);
            return {
                text: '❌ Erro ao realizar transferência. Tente novamente.',
                mentions: [sender.user_id]
            };
        }
    }
} 
import { Database } from '../database/Database';
import { User } from '../types';

export class BankManager {
    constructor(private database: Database) {}

    async showBankStatus(group_id: string): Promise<string> {
        const bank = await this.database.getBank(group_id);
        
        // Formata os números com separadores de milhar
        const formatNumber = (num: number): string => {
            return num.toLocaleString('pt-BR');
        };
        
        return `╭━━━━━━━━━━━━━━━━╮
┃ 🏦 *CBCOIN BANK* 🏦
╰━━━━━━━━━━━━━━━━╯

*INFORMAÇÕES DO COFRE*
┠⊷ 💰 Saldo: ${formatNumber(bank.balance)} CBCoins
┠⊷ 📊 Total de Taxas: ${formatNumber(bank.total_tax_collected)} CBCoins
┠⊷ 📈 Transferências: ${formatNumber(bank.total_transfers)}

*TAXAS E LIMITES*
┠⊷ 💸 Taxa por transferência: 5%
┠⊷ 💵 Transferência mínima: 100 CBCoins
┠⊷ 💰 Transferência máxima: 1,000,000 CBCoins
┠⊷ 📅 Limite diário: 5,000,000 CBCoins

*COMANDOS*
┠⊷ !transferir @usuário valor
┃ ⤷ Transfere CBCoins para alguém
┠⊷ !banco
┃ ⤷ Mostra status do banco

©️ CBCoin Bank 2024`;
    }
} 
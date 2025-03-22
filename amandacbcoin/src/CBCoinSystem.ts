import { WAMessage } from '@whiskeysockets/baileys';
import { Database } from './database/Database';
import { DailyManager } from './daily/DailyManager';
import { WorkManager } from './work/WorkManager';
import { MiningManager } from './mining/MiningManager';
import { RobberyManager } from './robbery/RobberyManager';
import { InventoryManager } from './inventory/InventoryManager';
import { ShopManager } from '../../src/shop/ShopManager';
import { GamesManager } from './games/GamesManager';
import { LevelManager } from './levels/LevelManager';
import { extractMessageContent, extractUserName } from './utils/messageUtils';
import { CBCoinState } from './CBCoinState';
import { User, CommandResponse } from './types';
import { TransferManager } from './transfer/TransferManager';
import { BankManager } from './bank/BankManager';
import { FishingManager } from './fishing/FishingManager';
import { FarmingManager } from './farming/FarmingManager';

export class CBCoinSystem {
    private database: Database;
    private state: CBCoinState;
    private dailyManager: DailyManager;
    private workManager: WorkManager;
    private miningManager: MiningManager;
    private robberyManager: RobberyManager;
    private inventoryManager: InventoryManager;
    private shopManager: ShopManager;
    private gamesManager: GamesManager;
    private levelManager: LevelManager;
    private transferManager: TransferManager;
    private bankManager: BankManager;
    private fishingManager: FishingManager;
    private farmingManager: FarmingManager;

    constructor(mongoUri: string) {
        this.database = new Database(mongoUri);
        this.state = new CBCoinState(mongoUri);
        this.dailyManager = new DailyManager(this.database);
        this.workManager = new WorkManager(this.database);
        this.miningManager = new MiningManager(this.database);
        this.robberyManager = new RobberyManager(this.database);
        this.inventoryManager = new InventoryManager(this.database);
        this.shopManager = new ShopManager(this.database);
        this.gamesManager = new GamesManager(this.database);
        this.levelManager = new LevelManager(this.database);
        this.transferManager = new TransferManager(this.database);
        this.bankManager = new BankManager(this.database);
        this.fishingManager = new FishingManager(this.database);
        this.farmingManager = new FarmingManager(this.database);
    }

    async connect(): Promise<void> {
        await this.database.connect();
        await this.state.connect();
    }

    async disconnect(): Promise<void> {
        await this.database.disconnect();
        await this.state.disconnect();
    }

    private isCBCoinCommand(command: string): boolean {
        const cbcoinCommands = [
            '!diario', '!daily',
            '!trabalhar', '!work',
            '!minerar', '!mine',
            '!roubar', '!rob',
            '!saldo', '!balance',
            '!perfil', '!profile',
            '!top', '!ranking',
            '!inventario', '!inventory',
            '!loja', '!shop',
            '!comprar', '!buy',
            '!usar', '!use',
            '!flip', '!coinflip',
            '!slots', '!slot',
            '!transferir', '!pay',
            '!banco', '!bancocbcoin',
            '!abrircbcoin', '!fecharcbcoin',
            '!pescar', '!fish',
            '!plantar', '!colher',
            '!menuagricultura',
            '!plantacao',
            '!plantacoes'
        ];
        return cbcoinCommands.includes(command);
    }

    async handleCommand(msg: WAMessage): Promise<CommandResponse> {
        try {
            const text = extractMessageContent(msg);
            if (!text) {
                return { text: '❌ Mensagem inválida!', mentions: [] };
            }

            const command = text.toLowerCase().trim().split(' ')[0];
            const args = text.toLowerCase().trim().split(' ').slice(1);
            
            // Verifica se é um comando CBCoin válido
            if (!this.isCBCoinCommand(command)) {
                console.log('Comando não reconhecido:', command);
                return { text: '❌ Comando inválido!', mentions: [] };
            }

            const user_id = msg.key.participant || msg.key.remoteJid || '';
            const group_id = msg.key.remoteJid || '';
            const userName = extractUserName(msg);

            // Verifica se o CBCoin está ativo no grupo
            // Permite comandos de administração mesmo com CBCoin desativado
            const adminCommands = ['!abrircbcoin', '!fecharcbcoin', '!banco', '!bancocbcoin'];
            if (!this.state.isActive(group_id) && !adminCommands.includes(command)) {
                return { text: '❌ O CBCoin não está ativo neste grupo!\nUse !abrircbcoin para ativar.', mentions: [] };
            }

            const user = await this.database.getUser(user_id, group_id, userName);
            let response: CommandResponse = { text: '', mentions: [] };
            let xpGained: number | undefined;

            switch (command) {
                case '!daily':
                case '!diario': {
                    const result = await this.dailyManager.claimDaily(user);
                    response.text = result.text;
                    response.mentions = result.mentions;
                    break;
                }

                case '!work':
                case '!trabalhar': {
                    const workResult = await this.workManager.work(user);
                    response.text = workResult.text;
                    xpGained = workResult.xpGained;
                    response.mentions = [user_id];
                    break;
                }

                case '!rob':
                case '!roubar': {
                    if (!args[0]) {
                        return { text: '❌ Você precisa mencionar alguém para roubar!', mentions: [] };
                    }
                    const targetId = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                    const target = await this.database.getUser(targetId, group_id);
                    const robResult = await this.robberyManager.rob(user, target);
                    response.text = robResult.text;
                    xpGained = robResult.xpGained;
                    response.mentions = [user_id, targetId];
                    break;
                }

                case '!mine':
                case '!minerar': {
                    const mineResult = await this.miningManager.mine(user);
                    response.text = mineResult.text;
                    xpGained = mineResult.xpGained;
                    response.mentions = [user_id];
                    break;
                }

                case '!shop':
                case '!loja': {
                    response.text = await this.shopManager.showShop();
                    break;
                }

                case '!buy':
                case '!comprar': {
                    if (!args[0]) {
                        return { text: '❌ Você precisa especificar o ID do item que deseja comprar!', mentions: [] };
                    }
                    response.text = await this.shopManager.buyItem(user, args[0]);
                    response.mentions = [user_id];
                    break;
                }

                case '!inventory':
                case '!inventario': {
                    response.text = await this.inventoryManager.showInventory(user);
                    response.mentions = [user_id];
                    break;
                }

                case '!use':
                case '!usar': {
                    if (!args[0]) {
                        return { text: '❌ Você precisa especificar o ID do item que deseja usar!', mentions: [] };
                    }
                    response.text = await this.inventoryManager.useItem(user, args[0]);
                    response.mentions = [user_id];
                    break;
                }

                case '!profile':
                case '!perfil': {
                    response.text = await this.levelManager.getProfile(user);
                    response.mentions = [user_id];
                    break;
                }

                case '!balance':
                case '!saldo': {
                    response.text = `💰 *Saldo de ${user.name}*\n\nCBCoins: ${user.balance}`;
                    response.mentions = [user_id];
                    break;
                }

                case '!top':
                case '!ranking': {
                    const topUsers = await this.database.getTopUsers(group_id);
                    response.text = '🏆 *Ranking - Top 10 mais ricos*\n\n';
                    response.mentions = [];
                    
                    for (let i = 0; i < topUsers.length; i++) {
                        const topUser = topUsers[i];
                        response.text += `${i + 1}. ${topUser.name}: ${topUser.balance} CBCoins\n`;
                        response.mentions.push(topUser.user_id);
                    }
                    break;
                }

                case '!flip':
                case '!coinflip':
                case '!apostar': {
                    const text = msg.message?.conversation ||
                                 msg.message?.extendedTextMessage?.text ||
                                 '';
                    const args = text.split(' ');
                    if (args.length < 3) {
                        response.text = '❌ Você precisa especificar cara/coroa e o valor!\nExemplo: !apostar cara 100';
                        response.mentions = [user_id];
                        return response;
                    }

                    const choice = args[1].toLowerCase();
                    if (choice !== 'cara' && choice !== 'coroa') {
                        response.text = '❌ Você precisa escolher cara ou coroa!\nExemplo: !apostar cara 100';
                        response.mentions = [user_id];
                        return response;
                    }

                    const amount = parseInt(args[2]);
                    if (isNaN(amount)) {
                        response.text = '❌ Você precisa especificar um valor válido!\nExemplo: !apostar cara 100';
                        response.mentions = [user_id];
                        return response;
                    }

                    // Verifica se o usuário tem nível suficiente
                    if (user.level < 2) {
                        response.text = '❌ Você precisa ser nível 2 para jogar!\nContinue trabalhando e minerando para subir de nível.';
                        response.mentions = [user_id];
                        return response;
                    }

                    const result = await this.gamesManager.playFlip(user, amount, choice);
                    response.text = result.text;
                    response.mentions = [user_id];
                    return response;
                }

                case '!slots':
                case '!slot': {
                    const text = msg.message?.conversation ||
                                 msg.message?.extendedTextMessage?.text ||
                                 '';
                    const args = text.split(' ');
                    if (args.length < 2) {
                        response.text = '❌ Você precisa especificar quanto quer apostar!\nExemplo: !slots 100';
                        response.mentions = [user_id];
                        return response;
                    }

                    const amount = parseInt(args[1]);
                    if (isNaN(amount)) {
                        response.text = '❌ Você precisa especificar um valor válido!\nExemplo: !slots 100';
                        response.mentions = [user_id];
                        return response;
                    }

                    // Verifica se o usuário tem nível suficiente
                    if (user.level < 2) {
                        response.text = '❌ Você precisa ser nível 2 para jogar!\nContinue trabalhando e minerando para subir de nível.';
                        response.mentions = [user_id];
                        return response;
                    }

                    const result = await this.gamesManager.playSlots(user, amount);
                    response.text = result.text;
                    response.mentions = [user_id];
                    return response;
                }

                case '!abrircbcoin': {
                    response.text = await this.state.openCBCoin(group_id);
                    break;
                }

                case '!fecharcbcoin': {
                    response.text = await this.state.closeCBCoin(group_id);
                    break;
                }

                case '!transferir':
                case '!pay': {
                    if (args.length < 2) {
                        return {
                            text: '❌ Use: !transferir @usuário valor\nExemplo: !transferir @user 1000',
                            mentions: [user_id]
                        };
                    }

                    // Extrai o ID do usuário da menção
                    const receiverId = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                    const amount = parseInt(args[1]);

                    if (isNaN(amount)) {
                        return {
                            text: '❌ Valor inválido! Use números inteiros.\nExemplo: !transferir @user 1000',
                            mentions: [user_id]
                        };
                    }

                    if (receiverId === user_id) {
                        return {
                            text: '❌ Você não pode transferir CBCoins para si mesmo!',
                            mentions: [user_id]
                        };
                    }

                    response = await this.transferManager.transfer(user, receiverId, amount);
                    break;
                }

                case '!banco':
                case '!bancocbcoin': {
                    console.log('Processando comando do banco para o grupo:', group_id);
                    response.text = await this.bankManager.showBankStatus(group_id);
                    console.log('Resposta do banco:', response.text);
                    break;
                }

                case '!fish':
                case '!pescar': {
                    const fishResult = await this.fishingManager.fish(user);
                    response.text = fishResult.text;
                    xpGained = fishResult.xpGained;
                    response.mentions = fishResult.mentions;
                    break;
                }

                case '!plantacao':
                case '!plantacoes':
                case '!plantacao':
                    const crops = user.crops;
                    if (!crops || crops.length === 0) {
                        return {
                            text: '❌ Você não tem nenhuma plantação no momento!\nUse !plantar para começar a plantar.',
                            mentions: [user.user_id]
                        };
                    }

                    const crop = crops[0];
                    const now = new Date();
                    const readyTime = new Date(crop.readyAt);
                    const harvestDeadline = new Date(readyTime.getTime() + crop.harvestWindow);

                    let status = '';
                    if (now < readyTime) {
                        const timeLeft = this.farmingManager.formatTime(readyTime.getTime() - now.getTime());
                        status = `⏳ Crescendo (faltam ${timeLeft})`;
                    } else if (now < harvestDeadline) {
                        status = '✅ Pronta para colher!';
                    } else {
                        status = '⚠️ ATENÇÃO: Plantação pode apodrecer!';
                    }

                    return {
                        text: `🌱 *SUA PLANTAÇÃO*\n\n` +
                              `${crop.emoji} Tipo: ${crop.name}\n` +
                              `📊 Status: ${status}\n` +
                              `💰 Valor base: ${crop.value} CBCoins\n` +
                              `✨ XP: ${crop.xp}\n` +
                              `🕒 Plantado em: ${crop.plantedAt.toLocaleString()}\n` +
                              `⏰ Fica pronto em: ${readyTime.toLocaleString()}\n\n` +
                              `Use !colher quando estiver pronto!`,
                        mentions: [user.user_id]
                    };

                case '!plantar':
                    if (!args[0]) {
                        return {
                            text: '❌ Você precisa especificar qual semente deseja plantar!\nExemplo: !plantar cenoura',
                            mentions: [user.user_id]
                        };
                    }

                    const plantResult = await this.farmingManager.plant(user.user_id, user.group_id, args[0]);
                    return {
                        text: plantResult.message,
                        mentions: [user.user_id]
                    };

                case '!colher':
                    const harvestResult = await this.farmingManager.harvest(user.user_id, user.group_id);
                    return {
                        text: harvestResult.message,
                        mentions: [user.user_id]
                    };

                default: {
                    return { text: '❌ Comando inválido!', mentions: [] };
                }
            }

            // Se ganhou XP, verifica level up
            if (xpGained) {
                const levelUpMessage = await this.levelManager.addXP(user, xpGained);
                if (levelUpMessage) {
                    response.text += '\n\n' + levelUpMessage;
                }
                response.xp_gained = xpGained;
            }

            return response;

        } catch (error) {
            console.error('Erro ao processar comando:', error);
            return {
                text: '❌ Ocorreu um erro ao processar seu comando. Tente novamente mais tarde.',
                mentions: []
            };
        }
    }
} 
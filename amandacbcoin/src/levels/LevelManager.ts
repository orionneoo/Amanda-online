import { Database } from '../database/Database';
import { User } from '../types';

interface LevelResponse {
    text: string;
    mentions: string[];
}

export class LevelManager {
    private readonly XP_PER_LEVEL = 1000; // XP base por nível
    private readonly LEVEL_MULTIPLIER = 1.5; // Multiplicador de XP por nível

    constructor(private database: Database) {}

    private calculateXPForLevel(level: number): number {
        return Math.floor(this.XP_PER_LEVEL * Math.pow(this.LEVEL_MULTIPLIER, level - 1));
    }

    private calculateLevel(xp: number): { level: number, currentXP: number, nextLevelXP: number } {
        let level = 1;
        let totalXPForNextLevel = this.calculateXPForLevel(level);

        while (xp >= totalXPForNextLevel) {
            level++;
            totalXPForNextLevel += this.calculateXPForLevel(level);
        }

        const previousLevelXP = totalXPForNextLevel - this.calculateXPForLevel(level);
        const currentXP = xp - previousLevelXP;
        const nextLevelXP = this.calculateXPForLevel(level);

        return { level, currentXP, nextLevelXP };
    }

    async addXP(user: User, amount: number): Promise<string> {
        try {
            const oldLevel = this.calculateLevel(user.xp).level;
            const newXP = user.xp + amount;
            const newLevelInfo = this.calculateLevel(newXP);

            // Se subiu de nível
            if (newLevelInfo.level > oldLevel) {
                const reward = this.getLevelReward(newLevelInfo.level);
                await this.database.updateUser(user.user_id, user.group_id, {
                    xp: newXP,
                    level: newLevelInfo.level,
                    balance: user.balance + reward
                });

                return `🎉 *LEVEL UP!* 🎉\n\n` +
                    `👤 @${user.user_id.split('@')[0]}\n` +
                    `📊 Nível ${oldLevel} ➡️ ${newLevelInfo.level}\n` +
                    `💰 Recompensa: ${reward} CBCoins\n\n` +
                    `✨ Novos recursos desbloqueados:\n` +
                    this.getUnlockedFeatures(newLevelInfo.level);
            }

            // Apenas atualiza XP
            await this.database.updateUser(user.user_id, user.group_id, {
                xp: newXP,
                level: newLevelInfo.level
            });

            return `⭐ +${amount} XP!\n` +
                `📊 Progresso: ${newLevelInfo.currentXP}/${newLevelInfo.nextLevelXP} XP`;
        } catch (error) {
            console.error('Erro ao adicionar XP:', error);
            return '❌ Erro ao processar XP. Tente novamente.';
        }
    }

    private getLevelReward(level: number): number {
        switch (level) {
            case 2: return 1000;  // Nível 2: 1,000 CBCoins
            case 3: return 2500;  // Nível 3: 2,500 CBCoins
            case 4: return 5000;  // Nível 4: 5,000 CBCoins
            case 5: return 10000; // Nível 5: 10,000 CBCoins
            default: return 0;
        }
    }

    private getUnlockedFeatures(level: number): string {
        const features: { [key: number]: string[] } = {
            2: ['🎲 Jogos de apostas desbloqueados'],
            3: ['🎣 Trabalho de pescador disponível'],
            5: ['🦹 Habilidade de roubo melhorada'],
            7: ['💼 Novos trabalhos disponíveis'],
            10: ['👑 Status VIP desbloqueado'],
            15: ['🌟 Multiplicador de ganhos permanente'],
            20: ['🏆 Título de veterano']
        };

        return features[level]?.map(f => `- ${f}`).join('\n') || '';
    }

    async showProfile(user: User): Promise<string> {
        try {
            const levelInfo = this.calculateLevel(user.xp);
            const nextLevelReward = this.getLevelReward(levelInfo.level + 1);

            let response = `👤 *PERFIL DO USUÁRIO* 👤\n\n`;
            response += `Nome: @${user.user_id.split('@')[0]}\n`;
            response += `Nível: ${levelInfo.level}\n`;
            response += `XP: ${levelInfo.currentXP}/${levelInfo.nextLevelXP}\n`;
            response += `Progresso: ${'▓'.repeat(Math.floor(levelInfo.currentXP / levelInfo.nextLevelXP * 10))}${'░'.repeat(10 - Math.floor(levelInfo.currentXP / levelInfo.nextLevelXP * 10))}\n\n`;
            
            response += `💰 CBCoins: ${user.balance}\n`;
            response += `🎯 Próxima recompensa: ${nextLevelReward} CBCoins\n\n`;

            if (user.skills) {
                response += `🎯 *HABILIDADES*\n`;
                response += `XP Boost: ${user.skills.xp_boost}x\n`;
                response += `Multiplicador de Trabalho: ${user.skills.work_multiplier}x\n`;
                response += `Chance de Roubo: ${user.skills.rob_chance * 100}%\n\n`;
            }

            if (user.achievements?.length > 0) {
                response += `🏆 *CONQUISTAS*\n`;
                response += user.achievements.map(a => `- ${a}`).join('\n');
            }

            return response;
        } catch (error) {
            console.error('Erro ao mostrar perfil:', error);
            return '❌ Erro ao carregar perfil. Tente novamente.';
        }
    }

    async showLeaderboard(groupId: string): Promise<LevelResponse> {
        try {
            const users = await this.database.getTopUsers(groupId);
            let response = `🏆 *RANKING DE NÍVEIS* 🏆\n\n`;
            const mentions: string[] = [];

            users.sort((a, b) => b.level - a.level || b.xp - a.xp);

            users.forEach((user, index) => {
                const levelInfo = this.calculateLevel(user.xp);
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
                response += `${medal} ${index + 1}. @${user.user_id.split('@')[0]}\n`;
                response += `   Nível ${levelInfo.level} (${user.xp} XP)\n`;
                mentions.push(user.user_id);
            });

            return { text: response, mentions };
        } catch (error) {
            console.error('Erro ao mostrar ranking:', error);
            return { 
                text: '❌ Erro ao carregar ranking. Tente novamente.',
                mentions: []
            };
        }
    }

    async checkAchievements(user: User): Promise<string[]> {
        const newAchievements: string[] = [];

        const achievements = {
            'Milionário': user.balance >= 1000000,
            'Mestre do XP': user.skills.xp_boost >= 2,
            'Trabalhador Eficiente': user.skills.work_multiplier >= 2,
            'Ladrão Habilidoso': user.skills.rob_chance >= 0.3,
            'Veterano': user.level >= 20,
            'Colecionador': user.inventory.length >= 10
        };

        for (const [achievement, condition] of Object.entries(achievements)) {
            if (condition && !user.achievements.includes(achievement)) {
                newAchievements.push(achievement);
            }
        }

        if (newAchievements.length > 0) {
            const updatedAchievements = [...user.achievements, ...newAchievements];
            await this.database.updateUser(user.user_id, user.group_id, {
                achievements: updatedAchievements
            });
        }

        return newAchievements;
    }

    async getProfile(user: User): Promise<string> {
        const { level, currentXP, nextLevelXP } = this.calculateLevel(user.xp);
        const progressBar = this.createProgressBar(currentXP, nextLevelXP);
        const nextReward = this.getLevelReward(level + 1);

        // Seção de efeitos ativos
        let activeEffects = '';
        if (user.effects) {
            const effects = [];
            if (user.effects.xp_boost && user.effects.xp_boost.activeUntil && user.effects.xp_boost.activeUntil > new Date()) {
                effects.push(`⚡ XP Boost: ${user.effects.xp_boost.value}x (${this.formatTimeLeft(user.effects.xp_boost.activeUntil)})`);
            }
            if (user.effects.work_multiplier && user.effects.work_multiplier.activeUntil && user.effects.work_multiplier.activeUntil > new Date()) {
                effects.push(`💼 Trabalho: ${user.effects.work_multiplier.value}x (${this.formatTimeLeft(user.effects.work_multiplier.activeUntil)})`);
            }
            if (user.effects.rob_chance && user.effects.rob_chance.activeUntil && user.effects.rob_chance.activeUntil > new Date()) {
                effects.push(`🦹 Roubo: +${(user.effects.rob_chance.value * 100).toFixed(1)}% (${this.formatTimeLeft(user.effects.rob_chance.activeUntil)})`);
            }
            if (effects.length > 0) {
                activeEffects = `\n\n🌟 *EFEITOS ATIVOS*\n${effects.join('\n')}`;
            }
        }

        let profileModel = '';
        
        // Modelo baseado no nível
        if (level >= 5) {
            profileModel = `╔══✪〘 👑 PERFIL VIP 👑 〙✪══╗
║ 👤 Nome: ${user.name}
║ 💰 CBCoins: ${user.balance}
║ 📊 Nível: ${level}
║ ⭐ XP: ${currentXP}/${nextLevelXP}
║ ${progressBar}
║
║ 🎯 Habilidades:
║ 🌾 Agricultura: ${user.skills.farming}
║ ⛏️ Mineração: ${user.skills.mining}
║ 🎣 Pesca: ${user.skills.fishing}
║ 💹 Comércio: ${user.skills.trading}
║ 🎲 Apostas: ${user.skills.gambling}
║
║ 🔮 Bônus Base:
║ ⚡ XP: ${user.skills.xp_boost}x
║ 💼 Trabalho: ${user.skills.work_multiplier}x
║ 🦹 Roubo: ${(user.skills.rob_chance * 100).toFixed(1)}%
╚══✪〘 LEVEL ${level} 〙✪══╝${activeEffects}`;
        } else if (level >= 4) {
            profileModel = `┏━━━〘 🌟 PERFIL PRO 🌟 〙━━━┓
┃ 👤 Nome: ${user.name}
┃ 💰 CBCoins: ${user.balance}
┃ 📊 Nível: ${level}
┃ ⭐ XP: ${currentXP}/${nextLevelXP}
┃ ${progressBar}
┃
┃ 🎯 Habilidades:
┃ 🌾 Agricultura: ${user.skills.farming}
┃ ⛏️ Mineração: ${user.skills.mining}
┃ 🎣 Pesca: ${user.skills.fishing}
┃ 💹 Comércio: ${user.skills.trading}
┃ 🎲 Apostas: ${user.skills.gambling}
┃
┃ 🔮 Bônus Base:
┃ ⚡ XP: ${user.skills.xp_boost}x
┃ 💼 Trabalho: ${user.skills.work_multiplier}x
┗━━━〘 LEVEL ${level} 〙━━━┛${activeEffects}`;
        } else if (level >= 3) {
            profileModel = `╭═══〘 ⭐ PERFIL PLUS ⭐ 〙═══╮
│ 👤 Nome: ${user.name}
│ 💰 CBCoins: ${user.balance}
│ 📊 Nível: ${level}
│ ⭐ XP: ${currentXP}/${nextLevelXP}
│ ${progressBar}
│
│ 🎯 Habilidades:
│ 🌾 Agricultura: ${user.skills.farming}
│ ⛏️ Mineração: ${user.skills.mining}
│ 🎣 Pesca: ${user.skills.fishing}
│ 💹 Comércio: ${user.skills.trading}
│
│ 🔮 Bônus Base:
│ ⚡ XP: ${user.skills.xp_boost}x
╰═══〘 LEVEL ${level} 〙═══╯${activeEffects}`;
        } else if (level >= 2) {
            profileModel = `┌──〘 🎮 PERFIL 〙──┐
├ 👤 Nome: ${user.name}
├ 💰 CBCoins: ${user.balance}
├ 📊 Nível: ${level}
├ ⭐ XP: ${currentXP}/${nextLevelXP}
├ ${progressBar}
│
├ 🎯 Habilidades:
├ 🌾 Agricultura: ${user.skills.farming}
├ ⛏️ Mineração: ${user.skills.mining}
└──〘 LEVEL ${level} 〙──┘${activeEffects}`;
        } else {
            profileModel = `╭──〘 PERFIL 〙──╮
│ 👤 Nome: ${user.name}
│ 💰 CBCoins: ${user.balance}
│ 📊 Nível: ${level}
│ ⭐ XP: ${currentXP}/${nextLevelXP}
│ ${progressBar}
╰──〘 LEVEL ${level} 〙──╯${activeEffects}`;
        }

        // Adiciona informação sobre próximo nível se houver recompensa
        if (nextReward > 0) {
            profileModel += `\n\n🎁 Próxima recompensa: ${nextReward} CBCoins (Nível ${level + 1})`;
        }

        return profileModel;
    }

    private formatTimeLeft(date: Date): string {
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    async checkLevelUp(user: User): Promise<string | null> {
        const nextLevelXP = this.calculateXPForLevel(user.level + 1);
        
        if (user.xp >= nextLevelXP) {
            const newLevel = user.level + 1;
            const bonus = newLevel * 1000; // Bônus de CBCoins por level up
            
            await this.database.updateUser(user.user_id, user.group_id, {
                level: newLevel,
                balance: user.balance + bonus
            });

            return `🎉 *LEVEL UP!*\n` +
                   `Você alcançou o nível ${newLevel}!\n` +
                   `Bônus: +${bonus} CBCoins`;
        }

        return null;
    }

    private createProgressBar(current: number, max: number): string {
        // Normaliza os valores para evitar problemas
        current = Math.max(0, Math.min(current, max));
        
        const barLength = 10;
        const progress = Math.floor((current / max) * barLength);
        const filled = '█'.repeat(progress);
        const empty = '▒'.repeat(barLength - progress);
        const percent = Math.floor((current / max) * 100);
        
        return `[${filled}${empty}] ${percent}%`;
    }
} 
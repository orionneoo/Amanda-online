import { Database } from '../database/Database';

export async function addXP(db: Database, userId: string, groupId: string, xp: number): Promise<void> {
    const user = await db.getUser(userId, groupId);
    if (!user) return;

    // Aplica multiplicador de XP se houver
    const xpBoost = user.effects?.xp_boost?.value || 1;
    const totalXP = Math.floor(xp * xpBoost);

    // Calcula o novo nível
    const currentLevel = user.level;
    const newXP = user.xp + totalXP;
    const xpForNextLevel = Math.floor(100 * Math.pow(1.5, currentLevel - 1));

    if (newXP >= xpForNextLevel) {
        // Level up!
        await db.updateUser(userId, groupId, {
            xp: newXP - xpForNextLevel,
            level: currentLevel + 1
        });
    } else {
        await db.updateUser(userId, groupId, {
            xp: newXP
        });
    }
} 
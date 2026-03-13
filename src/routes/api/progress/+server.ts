import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { XP_REWARDS, ACHIEVEMENT_META } from '$lib/gamification';
import { CURRICULUM } from '$lib/curriculum';

export const POST: RequestHandler = async ({ request }) => {
	const { lessonId } = await request.json();

	if (!lessonId) return json({ error: 'Missing lessonId' }, { status: 400 });

	// Mark lesson complete
	const progress = await db.lessonProgress.upsert({
		where: { lessonId },
		update: { completed: true, completedAt: new Date() },
		create: { lessonId, completed: true, completedAt: new Date() }
	});

	let xpGained = XP_REWARDS.LESSON_COMPLETED;
	const newAchievements: Array<{ type: string; label: string; icon: string; desc: string }> = [];

	// Update stats
	const stats = await db.userStats.upsert({
		where: { id: 'singleton' },
		update: {
			xp: { increment: xpGained },
			lastActivity: new Date()
		},
		create: { id: 'singleton', xp: xpGained, lastActivity: new Date() }
	});

	// Check first lesson achievement
	const totalCompleted = await db.lessonProgress.count({ where: { completed: true } });
	if (totalCompleted === 1) {
		const ach = await tryUnlockAchievement('FIRST_LESSON', 'First Lesson');
		if (ach) newAchievements.push({ type: 'FIRST_LESSON', ...ACHIEVEMENT_META.FIRST_LESSON });
	}

	// Check module completion
	const lesson = CURRICULUM.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id }))).find(
		(l) => l.id === lessonId
	);

	if (lesson) {
		const module = CURRICULUM.find((m) => m.id === lesson.moduleId);
		if (module) {
			const completedInModule = await db.lessonProgress.count({
				where: { lessonId: { in: module.lessons.map((l) => l.id) }, completed: true }
			});

			if (completedInModule === module.lessons.length) {
				xpGained += XP_REWARDS.MODULE_COMPLETED;
				await db.userStats.update({
					where: { id: 'singleton' },
					data: { xp: { increment: XP_REWARDS.MODULE_COMPLETED } }
				});

				const achievementMap: Record<string, string> = {
					'module-1': 'MODULE_1_COMPLETE',
					'module-2': 'MODULE_2_COMPLETE',
					'module-3': 'MODULE_3_COMPLETE',
					'module-4': 'MODULE_4_COMPLETE'
				};
				const achievementType = achievementMap[module.id];
				if (achievementType) {
					const meta = ACHIEVEMENT_META[achievementType as keyof typeof ACHIEVEMENT_META];
					const ach = await tryUnlockAchievement(achievementType, meta.label);
					if (ach) newAchievements.push({ type: achievementType, ...meta });
				}

				// Check all modules complete
				const allModuleIds = ['module-1', 'module-2', 'module-3', 'module-4'];
				const allDone = await Promise.all(
					allModuleIds.map(async (mid) => {
						const mod = CURRICULUM.find((m) => m.id === mid)!;
						const count = await db.lessonProgress.count({
							where: { lessonId: { in: mod.lessons.map((l) => l.id) }, completed: true }
						});
						return count === mod.lessons.length;
					})
				);
				if (allDone.every(Boolean)) {
					const ach = await tryUnlockAchievement('ALL_MODULES_COMPLETE', 'Zero to Hero');
					if (ach)
						newAchievements.push({ type: 'ALL_MODULES_COMPLETE', ...ACHIEVEMENT_META.ALL_MODULES_COMPLETE });
				}
			}
		}
	}

	// Check streak achievements
	if (stats.streak >= 7) {
		const ach = await tryUnlockAchievement('STREAK_7', 'Week Warrior');
		if (ach) newAchievements.push({ type: 'STREAK_7', ...ACHIEVEMENT_META.STREAK_7 });
	} else if (stats.streak >= 3) {
		const ach = await tryUnlockAchievement('STREAK_3', '3-Day Streak');
		if (ach) newAchievements.push({ type: 'STREAK_3', ...ACHIEVEMENT_META.STREAK_3 });
	}

	const updatedStats = await db.userStats.findUnique({ where: { id: 'singleton' } });

	return json({
		ok: true,
		xpGained,
		achievements: newAchievements,
		totalXP: updatedStats?.xp ?? 0
	});
};

async function tryUnlockAchievement(type: string, label: string) {
	try {
		return await db.achievement.create({ data: { type, label } });
	} catch {
		return null;
	}
}

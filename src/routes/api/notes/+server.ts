import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { XP_REWARDS, ACHIEVEMENT_META } from '$lib/gamification';

export const POST: RequestHandler = async ({ request }) => {
	const { lessonId, content } = await request.json();

	if (!lessonId || content === undefined) {
		return json({ error: 'Missing fields' }, { status: 400 });
	}

	// Check if note already exists
	const existing = await db.note.findUnique({ where: { lessonId } });
	const isFirst = !existing || !existing.content.trim();
	const wasEmpty = !existing?.content?.trim();

	// Upsert note
	await db.note.upsert({
		where: { lessonId },
		update: { content },
		create: { lessonId, content }
	});

	let xpGained = 0;
	const newAchievements: Array<{ type: string; label: string; icon: string }> = [];

	// Award XP only on first write for this lesson
	if (wasEmpty && content.trim()) {
		xpGained = XP_REWARDS.NOTE_SAVED;

		const stats = await db.userStats.upsert({
			where: { id: 'singleton' },
			update: {
				xp: { increment: xpGained },
				totalNotes: { increment: 1 },
				lastActivity: new Date()
			},
			create: { id: 'singleton', xp: xpGained, totalNotes: 1, lastActivity: new Date() }
		});

		await updateStreakAndActivity(stats);

		// Check achievements
		if (stats.totalNotes + 1 === 1) {
			const ach = await tryUnlockAchievement('FIRST_NOTE', 'First Note');
			if (ach) newAchievements.push({ type: 'FIRST_NOTE', ...ACHIEVEMENT_META.FIRST_NOTE });
		}
		if (stats.totalNotes + 1 >= 10) {
			const ach = await tryUnlockAchievement('NOTES_10', 'Note Taker');
			if (ach) newAchievements.push({ type: 'NOTES_10', ...ACHIEVEMENT_META.NOTES_10 });
		}
		if (stats.totalNotes + 1 >= 25) {
			const ach = await tryUnlockAchievement('NOTES_25', 'Scholar');
			if (ach) newAchievements.push({ type: 'NOTES_25', ...ACHIEVEMENT_META.NOTES_25 });
		}
	} else {
		// Still update activity timestamp for streak
		await db.userStats.update({
			where: { id: 'singleton' },
			data: { lastActivity: new Date() }
		});
	}

	return json({ ok: true, isFirst, xpGained, achievements: newAchievements });
};

async function tryUnlockAchievement(type: string, label: string) {
	try {
		return await db.achievement.create({ data: { type, label } });
	} catch {
		return null; // Already exists (unique constraint)
	}
}

async function updateStreakAndActivity(stats: { lastActivity: Date | null; streak: number; id: string }) {
	const now = new Date();
	const last = stats.lastActivity;

	if (!last) return;

	const yesterday = new Date(now);
	yesterday.setDate(yesterday.getDate() - 1);

	const lastDate = last.toDateString();
	const todayDate = now.toDateString();
	const yesterdayDate = yesterday.toDateString();

	if (lastDate === todayDate) return; // Already active today

	const newStreak = lastDate === yesterdayDate ? stats.streak + 1 : 1;

	await db.userStats.update({
		where: { id: 'singleton' },
		data: { streak: newStreak, xp: { increment: XP_REWARDS.DAILY_STREAK } }
	});
}

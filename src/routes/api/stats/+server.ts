import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async () => {
	const [stats, completedCount, notesCount, achievements] = await Promise.all([
		db.userStats.findUnique({ where: { id: 'singleton' } }),
		db.lessonProgress.count({ where: { completed: true } }),
		db.note.count({ where: { content: { not: '' } } }),
		db.achievement.findMany({ orderBy: { unlockedAt: 'desc' } })
	]);

	return json({
		stats: stats ?? { xp: 0, level: 1, streak: 0, totalNotes: 0 },
		completedCount,
		notesCount,
		achievements
	});
};

import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: LayoutServerLoad = async () => {
	const [stats, completedLessons, notesWithContent] = await Promise.all([
		db.userStats.findUnique({ where: { id: 'singleton' } }),
		db.lessonProgress.findMany({ where: { completed: true }, select: { lessonId: true } }),
		db.note.findMany({ where: { content: { not: '' } }, select: { lessonId: true } })
	]);

	return {
		stats: stats ?? { id: 'singleton', xp: 0, level: 1, streak: 0, lastActivity: null, totalNotes: 0 },
		completedLessonIds: completedLessons.map((l) => l.lessonId),
		notedLessonIds: notesWithContent.map((n) => n.lessonId)
	};
};

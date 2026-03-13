import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { CURRICULUM, getTotalLessons } from '$lib/curriculum';

export const load: PageServerLoad = async () => {
	const [stats, progressRows, achievements, notesCount] = await Promise.all([
		db.userStats.findUnique({ where: { id: 'singleton' } }),
		db.lessonProgress.findMany({ where: { completed: true }, select: { lessonId: true } }),
		db.achievement.findMany({ orderBy: { unlockedAt: 'desc' } }),
		db.note.count({ where: { content: { not: '' } } })
	]);

	const completedIds = new Set(progressRows.map((r) => r.lessonId));
	const totalLessons = getTotalLessons();
	const completedCount = completedIds.size;
	const overallPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

	// Per-module progress
	const moduleProgress = CURRICULUM.map((mod) => {
		const total = mod.lessons.length;
		const completed = mod.lessons.filter((l) => completedIds.has(l.id)).length;
		return {
			id: mod.id,
			title: mod.title,
			icon: mod.icon,
			total,
			completed,
			percent: total > 0 ? Math.round((completed / total) * 100) : 0
		};
	});

	// Find next lesson to study (first incomplete)
	let nextLesson: { id: string; title: string; moduleTitle: string } | null = null;
	outer: for (const mod of CURRICULUM) {
		for (const lesson of mod.lessons) {
			if (!completedIds.has(lesson.id)) {
				nextLesson = { id: lesson.id, title: lesson.title, moduleTitle: mod.title };
				break outer;
			}
		}
	}

	return {
		stats: stats ?? { xp: 0, level: 1, streak: 0, totalNotes: 0, lastActivity: null },
		overallPercent,
		completedCount,
		totalLessons,
		moduleProgress,
		achievements,
		notesCount,
		nextLesson
	};
};

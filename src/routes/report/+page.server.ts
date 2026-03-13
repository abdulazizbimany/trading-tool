import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { CURRICULUM, getTotalLessons } from '$lib/curriculum';

export const load: PageServerLoad = async () => {
	const now = new Date();
	const weekStart = new Date(now);
	weekStart.setDate(now.getDate() - now.getDay());
	weekStart.setHours(0, 0, 0, 0);

	const lastWeekStart = new Date(weekStart);
	lastWeekStart.setDate(lastWeekStart.getDate() - 7);

	const [stats, allProgress, allNotes, achievements, thisWeekProgress, thisWeekNotes] =
		await Promise.all([
			db.userStats.findUnique({ where: { id: 'singleton' } }),
			db.lessonProgress.findMany({ where: { completed: true } }),
			db.note.findMany({ where: { content: { not: '' } } }),
			db.achievement.findMany({ orderBy: { unlockedAt: 'desc' } }),
			db.lessonProgress.findMany({
				where: { completed: true, completedAt: { gte: weekStart } }
			}),
			db.note.findMany({
				where: { content: { not: '' }, updatedAt: { gte: weekStart } }
			})
		]);

	const totalLessons = getTotalLessons();
	const completedIds = new Set(allProgress.map((r) => r.lessonId));

	// Module breakdown
	const moduleBreakdown = CURRICULUM.map((mod) => {
		const completed = mod.lessons.filter((l) => completedIds.has(l.id)).length;
		return {
			id: mod.id,
			title: mod.title,
			icon: mod.icon,
			total: mod.lessons.length,
			completed,
			percent: mod.lessons.length ? Math.round((completed / mod.lessons.length) * 100) : 0
		};
	});

	return {
		stats: stats ?? { xp: 0, level: 1, streak: 0, totalNotes: 0 },
		totalLessons,
		completedTotal: allProgress.length,
		overallPercent: totalLessons ? Math.round((allProgress.length / totalLessons) * 100) : 0,
		thisWeekLessons: thisWeekProgress.length,
		thisWeekNotes: thisWeekNotes.length,
		achievements,
		moduleBreakdown,
		weekStartDate: weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
	};
};

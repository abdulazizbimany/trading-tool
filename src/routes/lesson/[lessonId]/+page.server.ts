import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { getLessonById, getNextLesson, getPrevLesson } from '$lib/curriculum';

export const load: PageServerLoad = async ({ params }) => {
	const { lessonId } = params;
	const found = getLessonById(lessonId);

	if (!found) throw error(404, 'Lesson not found');

	const [note, progress] = await Promise.all([
		db.note.findUnique({ where: { lessonId } }),
		db.lessonProgress.findUnique({ where: { lessonId } })
	]);

	const nextLesson = getNextLesson(lessonId);
	const prevLesson = getPrevLesson(lessonId);

	return {
		lesson: found.lesson,
		module: found.module,
		note: note?.content ?? '',
		completed: progress?.completed ?? false,
		nextLesson,
		prevLesson
	};
};

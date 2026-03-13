import { db } from './db';
import { CURRICULUM } from '$lib/curriculum';

let seeded = false;

export async function autoSeedIfEmpty() {
	if (seeded) return;

	const count = await db.module.count();
	if (count > 0) {
		seeded = true;
		return;
	}

	console.log('[seed] First launch detected, seeding curriculum...');

	for (const mod of CURRICULUM) {
		await db.module.upsert({
			where: { id: mod.id },
			update: { title: mod.title, order: mod.order },
			create: { id: mod.id, title: mod.title, order: mod.order }
		});

		for (const lesson of mod.lessons) {
			await db.lesson.upsert({
				where: { id: lesson.id },
				update: { title: lesson.title, order: lesson.order, moduleId: mod.id },
				create: { id: lesson.id, title: lesson.title, order: lesson.order, moduleId: mod.id }
			});
		}
	}

	// Create singleton user stats
	await db.userStats.upsert({
		where: { id: 'singleton' },
		update: {},
		create: { id: 'singleton' }
	});

	seeded = true;
	console.log('[seed] Curriculum seeded successfully!');
}

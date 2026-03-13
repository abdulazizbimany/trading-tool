import { db } from './db';
import { existsSync, mkdirSync, writeFileSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';

const BACKUP_DIR = join(process.cwd(), 'backups');
const MAX_BACKUPS = 7;

function ensureDir(dir: string) {
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export async function runBackup(): Promise<string> {
	const date = new Date().toISOString().split('T')[0];
	const backupPath = join(BACKUP_DIR, date);
	ensureDir(backupPath);

	// Fetch all notes with lesson + module info
	const notes = await db.note.findMany({
		where: { content: { not: '' } },
		include: { lesson: { include: { module: true } } },
		orderBy: [{ lesson: { module: { order: 'asc' } } }, { lesson: { order: 'asc' } }]
	});

	// Group by module
	const byModule: Record<string, typeof notes> = {};
	for (const note of notes) {
		const key = note.lesson.module.title;
		if (!byModule[key]) byModule[key] = [];
		byModule[key].push(note);
	}

	// Write per-module markdown files
	for (const [moduleName, moduleNotes] of Object.entries(byModule)) {
		const safeModuleName = moduleName.replace(/[^a-z0-9]/gi, '-');
		const moduleDir = join(backupPath, safeModuleName);
		ensureDir(moduleDir);

		for (const note of moduleNotes) {
			const safeLessonName = note.lesson.title.replace(/[^a-z0-9]/gi, '-');
			const filePath = join(moduleDir, `${safeLessonName}.md`);
			const content = `# ${note.lesson.title}\n\n> Module: ${note.lesson.module.title}\n\n${note.content}\n`;
			writeFileSync(filePath, content, 'utf-8');
		}
	}

	// Write JSON export
	const jsonData = {
		exportedAt: new Date().toISOString(),
		totalNotes: notes.length,
		notes: notes.map((n) => ({
			lessonId: n.lessonId,
			lessonTitle: n.lesson.title,
			moduleTitle: n.lesson.module.title,
			content: n.content,
			updatedAt: n.updatedAt
		}))
	};
	writeFileSync(join(backupPath, 'notes-export.json'), JSON.stringify(jsonData, null, 2), 'utf-8');

	// Prune old backups (keep MAX_BACKUPS)
	const allBackups = readdirSync(BACKUP_DIR)
		.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
		.sort();

	while (allBackups.length > MAX_BACKUPS) {
		const oldest = allBackups.shift()!;
		rmSync(join(BACKUP_DIR, oldest), { recursive: true, force: true });
		console.log(`[backup] Removed old backup: ${oldest}`);
	}

	console.log(`[backup] Backup completed: ${backupPath}`);
	return backupPath;
}

export async function generateWeeklyReport(): Promise<string> {
	const now = new Date();
	const weekStart = new Date(now);
	weekStart.setDate(now.getDate() - now.getDay());
	weekStart.setHours(0, 0, 0, 0);

	const stats = await db.userStats.findUnique({ where: { id: 'singleton' } });
	const completedCount = await db.lessonProgress.count({ where: { completed: true } });
	const notesCount = await db.note.count({ where: { content: { not: '' } } });
	const achievements = await db.achievement.findMany({ orderBy: { unlockedAt: 'desc' } });

	const weekStr = `${weekStart.toISOString().split('T')[0]}`;
	const reportDir = join(BACKUP_DIR, 'reports');
	ensureDir(reportDir);

	const report = `# Weekly Trading Journal Report
**Week of:** ${weekStr}
**Generated:** ${now.toISOString()}

## Stats
- **Total XP:** ${stats?.xp ?? 0}
- **Current Level:** ${stats?.level ?? 1}
- **Streak:** ${stats?.streak ?? 0} days
- **Lessons Completed:** ${completedCount}
- **Notes Written:** ${notesCount}

## Achievements Unlocked
${achievements.map((a) => `- ${a.label} (${a.unlockedAt.toISOString().split('T')[0]})`).join('\n') || '- None yet'}

---
*Keep up the great work! Every day you study brings you closer to becoming a trader.*
`;

	const filename = `week-${weekStr}.md`;
	writeFileSync(join(reportDir, filename), report, 'utf-8');
	console.log(`[report] Weekly report generated: ${filename}`);
	return report;
}

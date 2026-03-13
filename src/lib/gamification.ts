export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500];
export const LEVEL_NAMES = ['Novice', 'Apprentice', 'Trader', 'Expert', 'Master', 'Legend', 'Elite'];
export const LEVEL_COLORS = ['#94a3b8', '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ff6b6b'];

export const XP_REWARDS = {
	NOTE_SAVED: 10,
	LESSON_COMPLETED: 50,
	MODULE_COMPLETED: 150,
	DAILY_STREAK: 20
} as const;

export type AchievementType =
	| 'FIRST_NOTE'
	| 'FIRST_LESSON'
	| 'MODULE_1_COMPLETE'
	| 'MODULE_2_COMPLETE'
	| 'MODULE_3_COMPLETE'
	| 'MODULE_4_COMPLETE'
	| 'ALL_MODULES_COMPLETE'
	| 'STREAK_3'
	| 'STREAK_7'
	| 'NOTES_10'
	| 'NOTES_25';

export const ACHIEVEMENT_META: Record<AchievementType, { label: string; desc: string; icon: string }> = {
	FIRST_NOTE: { label: 'First Note', desc: 'Wrote your very first note', icon: '📝' },
	FIRST_LESSON: { label: 'First Lesson', desc: 'Completed your first lesson', icon: '✅' },
	MODULE_1_COMPLETE: { label: 'Basics Mastered', desc: 'Completed Module 1', icon: '1️⃣' },
	MODULE_2_COMPLETE: { label: 'Supply & Demand Pro', desc: 'Completed Module 2', icon: '2️⃣' },
	MODULE_3_COMPLETE: { label: 'Market Analyst', desc: 'Completed Module 3', icon: '3️⃣' },
	MODULE_4_COMPLETE: { label: 'Blueprint Complete', desc: 'Completed Module 4', icon: '🎯' },
	ALL_MODULES_COMPLETE: { label: 'Zero to Hero', desc: 'Completed the entire course!', icon: '🏆' },
	STREAK_3: { label: '3-Day Streak', desc: 'Studied 3 days in a row', icon: '🔥' },
	STREAK_7: { label: 'Week Warrior', desc: 'Studied 7 days in a row', icon: '⚡' },
	NOTES_10: { label: 'Note Taker', desc: 'Wrote 10 notes across lessons', icon: '📚' },
	NOTES_25: { label: 'Scholar', desc: 'Wrote 25 notes across lessons', icon: '🎓' }
};

export function getLevelFromXP(xp: number): number {
	let level = 0;
	for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
		if (xp >= LEVEL_THRESHOLDS[i]) {
			level = i;
			break;
		}
	}
	return Math.min(level, LEVEL_THRESHOLDS.length - 1);
}

export function getLevelName(xp: number): string {
	return LEVEL_NAMES[getLevelFromXP(xp)] ?? 'Elite';
}

export function getLevelColor(xp: number): string {
	return LEVEL_COLORS[getLevelFromXP(xp)] ?? '#ff6b6b';
}

export function getXPProgress(xp: number): {
	current: number;
	needed: number;
	percent: number;
	level: number;
	levelName: string;
	levelColor: string;
} {
	const level = getLevelFromXP(xp);
	const currentThreshold = LEVEL_THRESHOLDS[level] ?? 0;
	const nextThreshold = LEVEL_THRESHOLDS[level + 1];

	if (!nextThreshold) {
		return { current: xp, needed: 0, percent: 100, level, levelName: LEVEL_NAMES[level], levelColor: LEVEL_COLORS[level] };
	}

	const current = xp - currentThreshold;
	const needed = nextThreshold - currentThreshold;
	const percent = Math.min(Math.round((current / needed) * 100), 100);

	return {
		current,
		needed,
		percent,
		level,
		levelName: LEVEL_NAMES[level],
		levelColor: LEVEL_COLORS[level]
	};
}

export const MOTIVATIONAL_MESSAGES = [
	"You're crushing it! Keep going! 🚀",
	"Every lesson brings you closer to trading mastery! 💪",
	"Consistency is your edge. You've got this! 🎯",
	"Great traders are made, not born. You're on the right path! 📈",
	"One lesson at a time — you're building something amazing! ⚡",
	"Your future self will thank you for studying today! 🌟",
	"The market rewards the prepared. Keep learning! 💰",
	"Knowledge is your greatest trading tool! 🧠"
];

export function getMotivationalMessage(): string {
	return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
}

export function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return 'Good morning';
	if (hour < 17) return 'Good afternoon';
	return 'Good evening';
}

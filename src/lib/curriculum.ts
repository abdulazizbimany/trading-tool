export type Lesson = {
	id: string;
	title: string;
	order: number;
};

export type Module = {
	id: string;
	title: string;
	order: number;
	icon: string;
	lessons: Lesson[];
};

export const CURRICULUM: Module[] = [
	{
		id: 'welcome',
		title: 'Welcome',
		order: 0,
		icon: '👋',
		lessons: [
			{ id: 'welcome-intro', title: 'Introduction', order: 0 },
			{ id: 'welcome-walkthrough', title: 'Walkthrough', order: 1 },
			{ id: 'welcome-blueprint', title: 'Why Blueprint', order: 2 }
		]
	},
	{
		id: 'trading-platform',
		title: 'Trading Platform',
		order: 1,
		icon: '🖥️',
		lessons: [{ id: 'platform-overview', title: 'Platform Overview', order: 0 }]
	},
	{
		id: 'trading-basics-intro',
		title: 'Trading Basics',
		order: 2,
		icon: '📈',
		lessons: [
			{ id: 'tbi-good-trader', title: 'A Good Trader', order: 0 },
			{ id: 'tbi-supply-demand', title: 'Why Supply and Demand Matters', order: 1 }
		]
	},
	{
		id: 'earn-while-learn',
		title: 'Earn While You Learn',
		order: 3,
		icon: '💰',
		lessons: [
			{ id: 'ewl-charts', title: 'Using Charts in Live Sessions', order: 0 },
			{ id: 'ewl-sessions', title: 'Our Live Trading Sessions', order: 1 }
		]
	},
	{
		id: 'module-1',
		title: 'Module 1: Trading Basics',
		order: 4,
		icon: '1️⃣',
		lessons: [
			{ id: 'm1-terminology', title: 'Lesson 1: Terminology', order: 0 },
			{ id: 'm1-charts', title: 'Lesson 2: Charts', order: 1 },
			{ id: 'm1-risk', title: 'Lesson 3: Risk Management', order: 2 },
			{ id: 'm1-closing', title: 'Module Closing', order: 3 }
		]
	},
	{
		id: 'module-2',
		title: 'Module 2: Supply & Demand',
		order: 5,
		icon: '2️⃣',
		lessons: [
			{ id: 'm2-essentials', title: 'Lesson 1: Supply & Demand Essentials', order: 0 },
			{ id: 'm2-candles', title: 'Lesson 2: Candles', order: 1 },
			{ id: 'm2-mtf', title: 'Lesson 3: Multi Timeframe Analysis', order: 2 },
			{ id: 'm2-direction', title: 'Lesson 4: Direction', order: 3 },
			{ id: 'm2-decision', title: 'Lesson 5: Decision Process', order: 4 },
			{ id: 'm2-zones', title: 'Lesson 6: Zone Qualifiers', order: 5 },
			{ id: 'm2-elements', title: 'Lesson 7: Elements of a Trade', order: 6 },
			{ id: 'm2-price-action', title: 'Lesson 8: Price Action', order: 7 },
			{ id: 'm2-closing', title: 'Module Closing', order: 8 }
		]
	},
	{
		id: 'module-3',
		title: 'Module 3: Market Analysis',
		order: 6,
		icon: '3️⃣',
		lessons: [
			{ id: 'm3-fundamentals', title: 'Lesson 1: Introduction to Fundamentals', order: 0 },
			{ id: 'm3-cot', title: 'Lesson 2: Commitment of Traders (COT)', order: 1 },
			{ id: 'm3-valuation', title: 'Lesson 3: Valuation', order: 2 },
			{ id: 'm3-seasonality', title: 'Lesson 4: Seasonality', order: 3 },
			{ id: 'm3-closing', title: 'Module Closing', order: 4 }
		]
	},
	{
		id: 'module-4',
		title: 'Module 4: Putting It All Together',
		order: 7,
		icon: '🎯',
		lessons: [{ id: 'm4-all-together', title: 'Putting It All Together', order: 0 }]
	}
];

export function getTotalLessons(): number {
	return CURRICULUM.reduce((sum, m) => sum + m.lessons.length, 0);
}

export function getLessonById(id: string): { module: Module; lesson: Lesson } | null {
	for (const module of CURRICULUM) {
		const lesson = module.lessons.find((l) => l.id === id);
		if (lesson) return { module, lesson };
	}
	return null;
}

export function getNextLesson(lessonId: string): Lesson | null {
	for (let mi = 0; mi < CURRICULUM.length; mi++) {
		const lessons = CURRICULUM[mi].lessons;
		const li = lessons.findIndex((l) => l.id === lessonId);
		if (li === -1) continue;
		if (li < lessons.length - 1) return lessons[li + 1];
		if (mi < CURRICULUM.length - 1) return CURRICULUM[mi + 1].lessons[0];
		return null;
	}
	return null;
}

export function getPrevLesson(lessonId: string): Lesson | null {
	for (let mi = 0; mi < CURRICULUM.length; mi++) {
		const lessons = CURRICULUM[mi].lessons;
		const li = lessons.findIndex((l) => l.id === lessonId);
		if (li === -1) continue;
		if (li > 0) return lessons[li - 1];
		if (mi > 0) {
			const prev = CURRICULUM[mi - 1].lessons;
			return prev[prev.length - 1];
		}
		return null;
	}
	return null;
}

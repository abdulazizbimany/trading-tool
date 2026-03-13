<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, scale } from 'svelte/transition';
	import ProgressRing from '$lib/components/ProgressRing.svelte';
	import { getXPProgress, getGreeting, getMotivationalMessage, ACHIEVEMENT_META, getLevelColor } from '$lib/gamification';

	let { data } = $props();

	const greeting = getGreeting();
	const motivation = getMotivationalMessage();
	const xpInfo = $derived(getXPProgress(data.stats.xp));
	const levelColor = $derived(getLevelColor(data.stats.xp));

	// Animated counters
	let displayXP = $state(0);
	let displayStreak = $state(0);
	let displayNotes = $state(0);
	let displayPercent = $state(0);

	function animateCount(target: number, setter: (v: number) => void, duration = 1200) {
		const start = Date.now();
		const tick = () => {
			const elapsed = Date.now() - start;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			setter(Math.round(eased * target));
			if (progress < 1) requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	}

	onMount(() => {
		setTimeout(() => {
			animateCount(data.stats.xp, (v) => (displayXP = v));
			animateCount(data.stats.streak, (v) => (displayStreak = v), 800);
			animateCount(data.notesCount, (v) => (displayNotes = v), 900);
			animateCount(data.overallPercent, (v) => (displayPercent = v), 1400);
		}, 200);
	});
</script>

<div class="p-4 sm:p-6 max-w-6xl mx-auto">
	<!-- Greeting -->
	<div class="mb-6 sm:mb-8" in:fly={{ y: 20, duration: 400 }}>
		<h1 class="text-xl sm:text-2xl font-bold mb-1" style="color:#f1f5f9">
			{greeting}, Trader! 👋
		</h1>
		<p class="text-sm" style="color:#64748b">{motivation}</p>
	</div>

	<!-- Top stats row: 2 cols on mobile, 4 on lg -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
		<!-- Overall progress card -->
		<div class="card p-4 sm:p-5 flex flex-col items-center justify-center" in:fly={{ y: 20, delay: 50, duration: 400 }}>
			<ProgressRing
				percent={displayPercent}
				size={80}
				strokeWidth={6}
				color="#10b981"
				label="{displayPercent}%"
				sublabel="Complete"
			/>
			<p class="text-xs mt-2 text-center" style="color:#64748b">
				{data.completedCount}/{data.totalLessons} lessons
			</p>
		</div>

		<!-- XP card -->
		<div class="card p-4 sm:p-5 flex flex-col justify-between" in:fly={{ y: 20, delay: 100, duration: 400 }}>
			<div class="flex items-center justify-between mb-2 sm:mb-3">
				<span class="text-xs font-medium uppercase tracking-wide" style="color:#64748b">XP</span>
				<span class="text-xs px-1.5 py-0.5 rounded-full font-medium" style="background:rgba(16,185,129,0.1);color:{levelColor}">{xpInfo.levelName}</span>
			</div>
			<div>
				<div class="text-2xl sm:text-3xl font-bold mb-1" style="color:{levelColor}">{displayXP}</div>
				<div class="text-xs mb-2" style="color:#64748b">Total XP</div>
				<div class="h-1.5 rounded-full overflow-hidden mb-1" style="background:#1e1e35">
					<div class="h-full rounded-full xp-bar-fill" style="width:{xpInfo.percent}%"></div>
				</div>
				<div class="text-xs" style="color:#64748b">
					{#if xpInfo.needed > 0}
						{xpInfo.needed - xpInfo.current} to next
					{:else}
						Max level! 🏆
					{/if}
				</div>
			</div>
		</div>

		<!-- Streak card -->
		<div class="card p-4 sm:p-5 flex flex-col justify-between" in:fly={{ y: 20, delay: 150, duration: 400 }}>
			<div class="text-xs font-medium uppercase tracking-wide mb-2 sm:mb-3" style="color:#64748b">Streak</div>
			<div class="flex items-end gap-2">
				<span class="text-2xl sm:text-3xl font-bold" style="color:{data.stats.streak > 0 ? '#f59e0b' : '#64748b'}">{displayStreak}</span>
				<span class="text-lg mb-1">{data.stats.streak > 0 ? '🔥' : '💤'}</span>
			</div>
			<div class="text-xs mt-1" style="color:#64748b">
				{data.stats.streak === 0 ? 'Start a streak!' :
				 data.stats.streak === 1 ? 'Day 1 — keep going!' :
				 data.stats.streak < 7 ? `${data.stats.streak} days 🔥` :
				 `${data.stats.streak} days — incredible!`}
			</div>
		</div>

		<!-- Notes card -->
		<div class="card p-4 sm:p-5 flex flex-col justify-between" in:fly={{ y: 20, delay: 200, duration: 400 }}>
			<div class="text-xs font-medium uppercase tracking-wide mb-2 sm:mb-3" style="color:#64748b">Notes</div>
			<div class="flex items-end gap-2">
				<span class="text-2xl sm:text-3xl font-bold" style="color:#06b6d4">{displayNotes}</span>
				<span class="text-lg mb-1">📝</span>
			</div>
			<div class="text-xs mt-1" style="color:#64748b">
				{data.notesCount === 0 ? 'Write your first note!' :
				 data.notesCount < 5 ? 'Great start!' :
				 data.notesCount < 20 ? 'Solid collection!' :
				 'Note-taking machine!'}
			</div>
		</div>
	</div>

	<!-- Continue learning + Module progress: stack on mobile, 3 cols on md -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
		<!-- Continue learning + Achievements (col-span-1) -->
		<div class="flex flex-col gap-3 sm:gap-4">
			{#if data.nextLesson}
				<a
					href="/lesson/{data.nextLesson.id}"
					class="card p-4 sm:p-5 flex flex-col gap-3 glow-accent cursor-pointer transition-all duration-200"
					style="text-decoration:none;border-color:rgba(16,185,129,0.2)"
					in:fly={{ y: 20, delay: 250, duration: 400 }}
					onmouseenter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,0.4)')}
					onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,0.2)')}
				>
					<div class="flex items-center justify-between">
						<span class="text-xs font-medium uppercase tracking-wide" style="color:#10b981">Continue Learning</span>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7"/>
						</svg>
					</div>
					<div>
						<div class="text-sm font-semibold mb-1" style="color:#f1f5f9">{data.nextLesson.title}</div>
						<div class="text-xs" style="color:#64748b">{data.nextLesson.moduleTitle}</div>
					</div>
					<div
						class="w-full py-2 rounded-lg text-xs font-medium text-center"
						style="background:linear-gradient(135deg,#10b981,#059669);color:#000"
					>
						Start Lesson →
					</div>
				</a>
			{:else}
				<div class="card p-4 sm:p-5 flex flex-col items-center justify-center gap-3 text-center" in:fly={{ y: 20, delay: 250, duration: 400 }}>
					<span class="text-4xl">🏆</span>
					<div class="text-sm font-bold gradient-text">Course Complete!</div>
					<div class="text-xs" style="color:#64748b">You've completed all lessons. Amazing work!</div>
				</div>
			{/if}

			<!-- Achievements preview -->
			<div class="card p-4" in:fly={{ y: 20, delay: 300, duration: 400 }}>
				<div class="text-xs font-medium uppercase tracking-wide mb-3" style="color:#64748b">
					Achievements ({data.achievements.length})
				</div>
				{#if data.achievements.length === 0}
					<div class="text-xs text-center py-2" style="color:#2a2a45">
						Complete lessons to unlock achievements!
					</div>
				{:else}
					<div class="flex flex-wrap gap-2">
						{#each data.achievements.slice(0, 6) as ach, i (ach.id)}
							{@const meta = ACHIEVEMENT_META[ach.type as keyof typeof ACHIEVEMENT_META]}
							<div
								class="relative overflow-hidden flex flex-col items-center gap-1 p-2 rounded-lg text-center achievement-sweep"
								style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);min-width:56px"
								title="{meta?.desc ?? ach.label}"
								in:scale={{ delay: i * 50, duration: 300 }}
							>
								<span class="text-lg">{meta?.icon ?? '🏅'}</span>
								<span class="leading-tight" style="color:#94a3b8;font-size:10px">{meta?.label ?? ach.label}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Module progress (col-span-2 on md+) -->
		<div class="card p-4 sm:p-5 md:col-span-2" in:fly={{ y: 20, delay: 300, duration: 400 }}>
			<div class="text-xs font-medium uppercase tracking-wide mb-4" style="color:#64748b">Module Progress</div>
			<div class="flex flex-col gap-3">
				{#each data.moduleProgress as mod, i (mod.id)}
					<div in:fly={{ x: -10, delay: 350 + i * 40, duration: 300 }}>
						<div class="flex items-center justify-between mb-1.5">
							<div class="flex items-center gap-2 min-w-0">
								<span class="text-sm shrink-0">{mod.icon}</span>
								<span class="text-xs font-medium truncate" style="color:{mod.percent === 100 ? '#10b981' : '#94a3b8'}">{mod.title}</span>
							</div>
							<div class="flex items-center gap-2 shrink-0 ml-2">
								<span class="text-xs" style="color:#64748b">{mod.completed}/{mod.total}</span>
								<span class="text-xs font-medium" style="color:{mod.percent === 100 ? '#10b981' : '#64748b'}">{mod.percent}%</span>
								{#if mod.percent === 100}
									<svg width="12" height="12" viewBox="0 0 12 12">
										<circle cx="6" cy="6" r="5.5" stroke="#10b981" fill="rgba(16,185,129,0.15)" />
										<path class="draw-check" d="M3.5 6l2 2 3-3" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								{/if}
							</div>
						</div>
						<div class="h-1.5 rounded-full overflow-hidden" style="background:#1e1e35">
							<div
								class="h-full rounded-full fill-bar"
								style="
									width:{mod.percent}%;
									background:{mod.percent === 100 ? 'linear-gradient(90deg,#10b981,#06b6d4)' : 'linear-gradient(90deg,#10b981,#059669)'};
									animation-delay:{i * 100}ms
								"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

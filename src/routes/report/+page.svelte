<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { toast } from 'svelte-sonner';
	import ProgressRing from '$lib/components/ProgressRing.svelte';
	import { ACHIEVEMENT_META, getLevelColor, getXPProgress } from '$lib/gamification';

	let { data } = $props();

	const xpInfo = $derived(getXPProgress(data.stats.xp));
	const levelColor = $derived(getLevelColor(data.stats.xp));

	let backingUp = $state(false);

	async function triggerBackup() {
		backingUp = true;
		try {
			const res = await fetch('/api/backup', { method: 'POST' });
			if (res.ok) {
				toast.success('Backup completed! Notes saved to /backups folder 📁');
			} else {
				toast.error('Backup failed. Check server logs.');
			}
		} finally {
			backingUp = false;
		}
	}

	let notifPermission = $state(
		typeof Notification !== 'undefined' ? Notification.permission : 'default'
	);

	async function enableNotifications() {
		if (typeof Notification === 'undefined') {
			toast.error('Notifications not supported in this browser');
			return;
		}
		const result = await Notification.requestPermission();
		notifPermission = result;
		if (result === 'granted') {
			toast.success("Notifications enabled! You'll be reminded to study 🔔");
		} else {
			toast.error('Notification permission denied');
		}
	}
</script>

<div class="p-4 sm:p-6 max-w-5xl mx-auto">
	<!-- Header -->
	<div class="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between" in:fly={{ y: 20, duration: 400 }}>
		<div>
			<h1 class="text-xl sm:text-2xl font-bold mb-1" style="color:#f1f5f9">Weekly Report</h1>
			<p class="text-sm" style="color:#64748b">Week of {data.weekStartDate}</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<button
				onclick={triggerBackup}
				disabled={backingUp}
				class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
				style="background:#0f0f1a;color:#64748b;border:1px solid #1e1e35"
				onmouseenter={(e) => ((e.currentTarget as HTMLElement).style.color = '#94a3b8')}
				onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.color = '#64748b')}
			>
				{#if backingUp}
					<svg class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
					</svg>
					Backing up...
				{:else}
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
					</svg>
					Backup Notes
				{/if}
			</button>
			{#if notifPermission !== 'granted'}
				<button
					onclick={enableNotifications}
					class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
					style="background:rgba(16,185,129,0.1);color:#10b981;border:1px solid rgba(16,185,129,0.2)"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
					</svg>
					Enable Reminders
				</button>
			{:else}
				<div class="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs" style="color:#10b981;background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.15)">
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M20 6L9 17l-5-5"/>
					</svg>
					Reminders On
				</div>
			{/if}
		</div>
	</div>

	<!-- This week highlight: 2 cols on mobile, 4 on lg -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
		<div class="card p-4 sm:p-5 flex flex-col items-center" in:fly={{ y: 20, delay: 50, duration: 400 }}>
			<ProgressRing
				percent={data.overallPercent}
				size={80}
				strokeWidth={6}
				color="#10b981"
				label="{data.overallPercent}%"
				sublabel="Total"
			/>
			<p class="text-xs mt-2" style="color:#64748b">Overall Progress</p>
		</div>

		<div class="card p-4 sm:p-5" in:fly={{ y: 20, delay: 100, duration: 400 }}>
			<div class="text-xs uppercase tracking-wide mb-2 sm:mb-3" style="color:#64748b">This Week</div>
			<div class="text-2xl sm:text-3xl font-bold mb-1" style="color:#10b981">{data.thisWeekLessons}</div>
			<div class="text-xs" style="color:#64748b">lessons done</div>
			<div class="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold" style="color:#06b6d4">{data.thisWeekNotes}</div>
			<div class="text-xs" style="color:#64748b">notes written</div>
		</div>

		<div class="card p-4 sm:p-5" in:fly={{ y: 20, delay: 150, duration: 400 }}>
			<div class="text-xs uppercase tracking-wide mb-2 sm:mb-3" style="color:#64748b">Level</div>
			<div class="text-2xl sm:text-3xl font-bold mb-1" style="color:{levelColor}">{xpInfo.levelName}</div>
			<div class="text-xs mb-2" style="color:#64748b">Level {xpInfo.level + 1}</div>
			<div class="h-1.5 rounded-full overflow-hidden" style="background:#1e1e35">
				<div class="h-full rounded-full xp-bar-fill" style="width:{xpInfo.percent}%"></div>
			</div>
			<div class="text-xs mt-1" style="color:#64748b">{data.stats.xp} XP</div>
		</div>

		<div class="card p-4 sm:p-5" in:fly={{ y: 20, delay: 200, duration: 400 }}>
			<div class="text-xs uppercase tracking-wide mb-2 sm:mb-3" style="color:#64748b">Streak</div>
			<div class="flex items-center gap-2">
				<span class="text-2xl sm:text-3xl font-bold" style="color:{data.stats.streak > 0 ? '#f59e0b' : '#64748b'}">{data.stats.streak}</span>
				<span class="text-xl sm:text-2xl">{data.stats.streak > 0 ? '🔥' : '💤'}</span>
			</div>
			<div class="text-xs mt-2" style="color:#64748b">
				{data.stats.streak >= 7 ? 'Week Warrior! 🏆' :
				 data.stats.streak >= 3 ? 'On a roll! 💪' :
				 data.stats.streak === 0 ? 'Study today!' :
				 'Keep it up!'}
			</div>
		</div>
	</div>

	<!-- Module Breakdown + Achievements: stack on mobile, 2 cols on md -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
		<div class="card p-4 sm:p-5" in:fly={{ y: 20, delay: 250, duration: 400 }}>
			<div class="text-xs uppercase tracking-wide mb-4" style="color:#64748b">Module Breakdown</div>
			<div class="flex flex-col gap-3">
				{#each data.moduleBreakdown as mod, i (mod.id)}
					<div in:fly={{ x: -8, delay: 300 + i * 40, duration: 250 }}>
						<div class="flex items-center justify-between mb-1">
							<div class="flex items-center gap-1.5 min-w-0">
								<span class="text-sm shrink-0">{mod.icon}</span>
								<span class="text-xs truncate" style="color:{mod.percent === 100 ? '#10b981' : '#94a3b8'}">{mod.title}</span>
							</div>
							<span class="text-xs font-medium ml-2 shrink-0" style="color:{mod.percent === 100 ? '#10b981' : '#64748b'}">{mod.percent}%</span>
						</div>
						<div class="h-1 rounded-full overflow-hidden" style="background:#1e1e35">
							<div
								class="h-full rounded-full fill-bar"
								style="width:{mod.percent}%;background:{mod.percent === 100 ? 'linear-gradient(90deg,#10b981,#06b6d4)' : '#10b981'};animation-delay:{i*80}ms"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Achievements -->
		<div class="card p-4 sm:p-5" in:fly={{ y: 20, delay: 300, duration: 400 }}>
			<div class="text-xs uppercase tracking-wide mb-4" style="color:#64748b">
				All Achievements ({data.achievements.length})
			</div>
			{#if data.achievements.length === 0}
				<div class="flex flex-col items-center justify-center py-8 gap-3">
					<span class="text-4xl">🎯</span>
					<p class="text-sm text-center" style="color:#64748b">Complete lessons to unlock achievements!</p>
				</div>
			{:else}
				<div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
					{#each data.achievements as ach, i (ach.id)}
						{@const meta = ACHIEVEMENT_META[ach.type as keyof typeof ACHIEVEMENT_META]}
						<div
							class="relative overflow-hidden flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg text-center achievement-sweep"
							style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.12)"
							in:scale={{ delay: i * 60, duration: 300 }}
						>
							<span class="text-xl sm:text-2xl">{meta?.icon ?? '🏅'}</span>
							<span class="leading-tight" style="color:#94a3b8;font-size:10px">{meta?.label ?? ach.label}</span>
							<span style="color:#2a2a45;font-size:9px">
								{new Date(ach.unlockedAt).toLocaleDateString()}
							</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Motivational footer -->
	<div
		class="card p-5 sm:p-6 text-center"
		style="border-color:rgba(16,185,129,0.15);background:rgba(16,185,129,0.03)"
		in:fly={{ y: 20, delay: 400, duration: 400 }}
	>
		<div class="text-2xl mb-2">📈</div>
		<h3 class="text-base font-bold mb-2 gradient-text">Keep Going, Trader!</h3>
		<p class="text-sm max-w-md mx-auto" style="color:#64748b">
			{data.overallPercent === 100
				? "You've completed the entire course! You're a true trader now. 🏆"
				: data.overallPercent >= 50
					? "You're more than halfway there! The best traders are the most dedicated learners."
					: "Every great trader started where you are. Consistency is your biggest edge."}
		</p>
	</div>
</div>

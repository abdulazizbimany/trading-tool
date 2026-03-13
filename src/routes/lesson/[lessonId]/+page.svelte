<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import NoteEditor from '$lib/components/NoteEditor.svelte';
	import { ACHIEVEMENT_META } from '$lib/gamification';

	let { data } = $props();

	// Local state — intentionally initialized from prop once (user can mark complete in-session)
	// eslint-disable-next-line svelte/reactivity
	let completed = $state(data.completed);
	let isMarking = $state(false);
	let showXPFloat = $state(false);
	let xpGained = $state(0);

	async function markComplete() {
		if (completed || isMarking) return;
		isMarking = true;

		try {
			const res = await fetch('/api/progress', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lessonId: data.lesson.id })
			});
			const result = await res.json();

			if (result.ok) {
				completed = true;
				xpGained = result.xpGained;
				showXPFloat = true;
				setTimeout(() => (showXPFloat = false), 1500);

				toast.success(`+${result.xpGained} XP! Lesson complete! 🎉`, {
					duration: 3000
				});

				for (const ach of result.achievements) {
					const meta = ACHIEVEMENT_META[ach.type as keyof typeof ACHIEVEMENT_META];
					setTimeout(() => {
						toast.success(`🏅 Achievement Unlocked: ${meta?.label ?? ach.label}!`, {
							description: meta?.desc ?? '',
							duration: 4000
						});
					}, 500);
				}

				await invalidateAll();
			}
		} finally {
			isMarking = false;
		}
	}

	function handleNoteSave(_content: string, isFirst: boolean) {
		if (isFirst) {
			toast.success('+10 XP! First note for this lesson! 📝', { duration: 2500 });
		}
	}
</script>

<div class="flex flex-col h-[calc(100vh-56px)]">
	<!-- Lesson header -->
	<div
		class="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b shrink-0 gap-2"
		style="background:#09091a;border-color:#1e1e35"
		in:fly={{ y: -10, duration: 300 }}
	>
		<!-- Left: back + title -->
		<div class="flex items-center gap-2 min-w-0">
			{#if data.prevLesson}
				<a
					href="/lesson/{data.prevLesson.id}"
					class="flex items-center justify-center w-7 h-7 rounded transition-colors shrink-0"
					style="color:#64748b;text-decoration:none"
					title="Previous: {data.prevLesson.title}"
					onmouseenter={(e) => ((e.currentTarget as HTMLElement).style.color = '#94a3b8')}
					onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.color = '#64748b')}
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M19 12H5M12 19l-7-7 7-7"/>
					</svg>
				</a>
			{/if}

			<div class="min-w-0">
				<span class="text-xs px-2 py-0.5 rounded-full hidden sm:inline-block" style="background:rgba(100,116,139,0.15);color:#64748b">
					{data.module.icon} {data.module.title}
				</span>
				<h1 class="text-sm sm:text-base font-bold sm:mt-1 truncate" style="color:#f1f5f9">{data.lesson.title}</h1>
			</div>
		</div>

		<!-- Right: next + mark complete -->
		<div class="flex items-center gap-2 shrink-0">
			{#if data.nextLesson}
				<a
					href="/lesson/{data.nextLesson.id}"
					class="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs transition-colors"
					style="color:#64748b;text-decoration:none;background:#0f0f1a;border:1px solid #1e1e35"
					title="Next: {data.nextLesson.title}"
				>
					<span class="hidden sm:inline">Next</span>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M12 5l7 7-7 7"/>
					</svg>
				</a>
			{/if}

			<!-- Mark complete button -->
			<div class="relative">
				{#if showXPFloat}
					<div
						class="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold xp-float pointer-events-none whitespace-nowrap"
						style="color:#10b981"
						in:scale={{ duration: 150 }}
					>
						+{xpGained} XP!
					</div>
				{/if}

				{#if completed}
					<div
						class="flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium"
						style="background:rgba(16,185,129,0.1);color:#10b981;border:1px solid rgba(16,185,129,0.2)"
						in:scale={{ duration: 300 }}
					>
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
							<circle cx="8" cy="8" r="7.5" stroke="#10b981" fill="rgba(16,185,129,0.1)" />
							<path
								class="draw-check"
								d="M5 8l2.5 2.5 4-4"
								stroke="#10b981"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						<span class="hidden sm:inline">Completed</span>
					</div>
				{:else}
					<button
						onclick={markComplete}
						disabled={isMarking}
						class="flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer"
						style="background:linear-gradient(135deg,#10b981,#059669);color:#000;border:none;opacity:{isMarking ? 0.7 : 1}"
					>
						{#if isMarking}
							<svg class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
							</svg>
						{:else}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<path d="M20 6L9 17l-5-5"/>
							</svg>
						{/if}
						<span class="hidden sm:inline">{isMarking ? 'Saving...' : 'Mark Complete'}</span>
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Note editor (takes remaining height) -->
	<div class="flex-1 overflow-hidden">
		<NoteEditor
			lessonId={data.lesson.id}
			initialContent={data.note}
			onSave={handleNoteSave}
		/>
	</div>
</div>

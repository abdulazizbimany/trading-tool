<script lang="ts">
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { CURRICULUM } from '$lib/curriculum';

	let {
		completedLessons = new Set<string>(),
		notewrittenLessons = new Set<string>(),
		open = false,
		onClose = () => {}
	}: {
		completedLessons?: Set<string>;
		notewrittenLessons?: Set<string>;
		open?: boolean;
		onClose?: () => void;
	} = $props();

	let expandedModules = $state(new Set(CURRICULUM.map((m) => m.id)));

	function toggleModule(id: string) {
		if (expandedModules.has(id)) {
			expandedModules.delete(id);
		} else {
			expandedModules.add(id);
		}
		expandedModules = new Set(expandedModules);
	}

	function isLessonActive(lessonId: string) {
		return page.url.pathname === `/lesson/${lessonId}`;
	}

	function getModuleProgress(moduleId: string) {
		const mod = CURRICULUM.find((m) => m.id === moduleId);
		if (!mod) return 0;
		const completed = mod.lessons.filter((l) => completedLessons.has(l.id)).length;
		return mod.lessons.length ? Math.round((completed / mod.lessons.length) * 100) : 0;
	}

	const isHome = $derived(page.url.pathname === '/');
	const isReport = $derived(page.url.pathname === '/report');
</script>

<aside
	class="fixed top-14 left-0 bottom-0 w-64 overflow-y-auto border-r flex flex-col transition-transform duration-300 z-40 {open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"
	style="background:#0b0b15;border-color:#1e1e35"
>
	<!-- Mobile nav links (visible on mobile only) -->
	<div class="md:hidden px-2 pt-3 pb-2 border-b" style="border-color:#1e1e35">
		<a
			href="/"
			onclick={onClose}
			class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-1"
			style="color:{isHome ? '#10b981' : '#64748b'};background:{isHome ? 'rgba(16,185,129,0.08)' : 'transparent'};text-decoration:none"
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
			</svg>
			Dashboard
		</a>
		<a
			href="/report"
			onclick={onClose}
			class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
			style="color:{isReport ? '#10b981' : '#64748b'};background:{isReport ? 'rgba(16,185,129,0.08)' : 'transparent'};text-decoration:none"
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
			</svg>
			Weekly Report
		</a>
	</div>

	<nav class="flex-1 py-3 px-2">
		{#each CURRICULUM as mod, mi (mod.id)}
			{@const progress = getModuleProgress(mod.id)}
			{@const expanded = expandedModules.has(mod.id)}

			<div class="mb-1" in:fly={{ x: -8, delay: mi * 40, duration: 250 }}>
				<!-- Module header -->
				<button
					onclick={() => toggleModule(mod.id)}
					class="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left group"
					style="color:#94a3b8"
					onmouseenter={(e) => ((e.currentTarget as HTMLElement).style.background = '#0f0f1a')}
					onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
				>
					<span class="text-base shrink-0">{mod.icon}</span>
					<span class="flex-1 text-xs font-semibold uppercase tracking-wide truncate" style="color:#64748b">{mod.title}</span>
					<div class="flex items-center gap-1.5 shrink-0">
						{#if progress > 0}
							<span class="text-xs font-medium" style="color:#10b981">{progress}%</span>
						{/if}
						<svg
							width="12"
							height="12"
							viewBox="0 0 12 12"
							fill="none"
							style="transform: rotate({expanded ? 180 : 0}deg); transition: transform 0.2s ease; color:#64748b"
						>
							<path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</div>
				</button>

				<!-- Module progress bar -->
				{#if progress > 0}
					<div class="mx-3 mb-1 h-px rounded-full overflow-hidden" style="background:#1e1e35">
						<div
							class="h-full rounded-full"
							style="width:{progress}%;background:linear-gradient(90deg,#10b981,#06b6d4);transition:width 0.8s ease"
						></div>
					</div>
				{/if}

				<!-- Lessons -->
				{#if expanded}
					<div>
						{#each mod.lessons as lesson, li (lesson.id)}
							{@const active = isLessonActive(lesson.id)}
							{@const completed = completedLessons.has(lesson.id)}
							{@const hasNote = notewrittenLessons.has(lesson.id)}

							<a
								href="/lesson/{lesson.id}"
								onclick={onClose}
								class="sidebar-item relative flex items-center gap-2 px-3 py-2 mx-1 rounded-lg text-xs transition-all duration-200"
								style="
									color: {active ? '#10b981' : completed ? '#94a3b8' : '#64748b'};
									background: {active ? 'rgba(16,185,129,0.08)' : 'transparent'};
									text-decoration: none;
								"
								onmouseenter={(e) => {
									if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
									if (!active) (e.currentTarget as HTMLElement).style.color = '#e2e8f0';
								}}
								onmouseleave={(e) => {
									if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
									if (!active) (e.currentTarget as HTMLElement).style.color = completed ? '#94a3b8' : '#64748b';
								}}
							>
								<span class="shrink-0 w-4 h-4 flex items-center justify-center">
									{#if completed}
										<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
											<circle cx="7" cy="7" r="6.5" stroke="#10b981" stroke-width="1" fill="rgba(16,185,129,0.1)" />
											<path
												class="draw-check"
												d="M4.5 7l2 2 3-3"
												stroke="#10b981"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									{:else}
										<span class="w-1.5 h-1.5 rounded-full" style="background:{active ? '#10b981' : '#2a2a45'}"></span>
									{/if}
								</span>
								<span class="flex-1 truncate">{lesson.title}</span>
								{#if hasNote && !completed}
									<span class="shrink-0 w-1.5 h-1.5 rounded-full" style="background:#06b6d4;opacity:0.7"></span>
								{/if}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</nav>

	<!-- Footer (desktop only — mobile has it in the nav section above) -->
	<div class="hidden md:block p-3 border-t" style="border-color:#1e1e35">
		<a
			href="/report"
			class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
			style="color:#64748b;text-decoration:none"
			onmouseenter={(e) => {
				(e.currentTarget as HTMLElement).style.background = '#0f0f1a';
				(e.currentTarget as HTMLElement).style.color = '#94a3b8';
			}}
			onmouseleave={(e) => {
				(e.currentTarget as HTMLElement).style.background = 'transparent';
				(e.currentTarget as HTMLElement).style.color = '#64748b';
			}}
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
			</svg>
			Weekly Report
		</a>
	</div>
</aside>

<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import XPBar from '$lib/components/XPBar.svelte';
	import { Toaster } from 'svelte-sonner';

	let { data, children } = $props();

	const completedSet = $derived(new Set(data.completedLessonIds));
	const notedSet = $derived(new Set(data.notedLessonIds));
	const stats = $derived(data.stats);

	function hasStudiedToday(): boolean {
		if (!stats.lastActivity) return false;
		const last = new Date(stats.lastActivity);
		const today = new Date();
		return (
			last.getFullYear() === today.getFullYear() &&
			last.getMonth() === today.getMonth() &&
			last.getDate() === today.getDate()
		);
	}

	let bannerDismissed = $state(false);
	const showBanner = $derived(stats.streak > 0 && !hasStudiedToday() && !bannerDismissed);

	const isHome = $derived(page.url.pathname === '/');
	const isReport = $derived(page.url.pathname === '/report');

	let sidebarOpen = $state(false);
</script>

<Toaster richColors position="bottom-right" />

<div class="min-h-screen" style="background:#07070f">
	<!-- Header -->
	<header
		class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 border-b"
		style="background:rgba(7,7,15,0.95);border-color:#1e1e35;backdrop-filter:blur(12px)"
	>
		<div class="flex items-center gap-2">
			<!-- Hamburger (mobile only) -->
			<button
				class="md:hidden flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer"
				style="background:transparent;border:none;color:#64748b"
				onclick={() => (sidebarOpen = !sidebarOpen)}
				aria-label="Toggle menu"
			>
				{#if sidebarOpen}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/>
					</svg>
				{:else}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M3 12h18M3 6h18M3 18h18" stroke-linecap="round"/>
					</svg>
				{/if}
			</button>

			<a href="/" class="flex items-center gap-2" style="text-decoration:none">
				<div
					class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
					style="background:linear-gradient(135deg,#10b981,#06b6d4);color:#000"
				>
					TB
				</div>
				<div class="leading-tight hidden sm:block">
					<div class="text-sm font-bold" style="color:#f1f5f9">Trading Blueprint</div>
					<div class="text-xs" style="color:#64748b">Zero to Hero</div>
				</div>
			</a>
		</div>

		<nav class="hidden md:flex items-center gap-1">
			<a
				href="/"
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
				style="color:{isHome ? '#10b981' : '#64748b'};background:{isHome ? 'rgba(16,185,129,0.08)' : 'transparent'};text-decoration:none"
			>
				Dashboard
			</a>
			<a
				href="/report"
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
				style="color:{isReport ? '#10b981' : '#64748b'};background:{isReport ? 'rgba(16,185,129,0.08)' : 'transparent'};text-decoration:none"
			>
				Report
			</a>
		</nav>

		<div class="flex items-center gap-2 sm:gap-4">
			{#if stats.streak > 0}
				<div class="flex items-center gap-1 pulse-glow">
					<span class="text-sm">🔥</span>
					<span class="text-sm font-bold" style="color:#f59e0b">{stats.streak}</span>
				</div>
			{/if}
			<XPBar xp={stats.xp} />
		</div>
	</header>

	{#if showBanner}
		<div
			class="fixed z-40 flex items-center justify-between px-4 py-2.5"
			style="top:56px;left:0;right:0;background:rgba(245,158,11,0.1);border-bottom:1px solid rgba(245,158,11,0.2)"
			in:fly={{ y: -20, duration: 300 }}
		>
			<span class="text-xs sm:text-sm" style="color:#fbbf24">
				🔥 You haven't studied today. Keep that streak going!
			</span>
			<button
				onclick={() => (bannerDismissed = true)}
				class="text-xs px-2 py-1 rounded cursor-pointer ml-2 shrink-0"
				style="color:#64748b;background:transparent;border:none"
			>
				✕
			</button>
		</div>
	{/if}

	<!-- Mobile overlay -->
	{#if sidebarOpen}
		<div
			class="fixed inset-0 z-30 md:hidden"
			style="background:rgba(0,0,0,0.6);backdrop-filter:blur(2px)"
			onclick={() => (sidebarOpen = false)}
		></div>
	{/if}

	<div class="flex" style="padding-top:56px">
		<Sidebar
			completedLessons={completedSet}
			notewrittenLessons={notedSet}
			open={sidebarOpen}
			onClose={() => (sidebarOpen = false)}
		/>

		<main class="flex-1 overflow-auto md:ml-64" style="min-height:calc(100vh - 56px)">
			{#key page.url.pathname}
				<div in:fly={{ y: 16, duration: 250 }}>
					{@render children()}
				</div>
			{/key}
		</main>
	</div>
</div>

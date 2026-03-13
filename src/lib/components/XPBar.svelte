<script lang="ts">
	import { getXPProgress, getLevelColor } from '$lib/gamification';

	let { xp = 0 }: { xp?: number } = $props();

	const progress = $derived(getXPProgress(xp));
	const color = $derived(getLevelColor(xp));
</script>

<div class="flex items-center gap-3 min-w-0">
	<div class="flex flex-col items-end shrink-0">
		<span class="text-xs font-semibold" style="color:{color}">{progress.levelName}</span>
		<span class="text-xs" style="color:#64748b">Lv.{progress.level + 1}</span>
	</div>
	<div class="flex flex-col gap-1 min-w-0 w-32">
		<div class="flex justify-between text-xs" style="color:#64748b">
			<span>{xp} XP</span>
			{#if progress.needed > 0}
				<span>{progress.needed - progress.current} to next</span>
			{/if}
		</div>
		<div class="h-1.5 rounded-full overflow-hidden" style="background:#1e1e35">
			<div
				class="h-full rounded-full xp-bar-fill"
				style="width:{progress.percent}%;background:linear-gradient(90deg,{color},{color}99)"
			></div>
		</div>
	</div>
</div>

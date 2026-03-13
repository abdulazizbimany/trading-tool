<script lang="ts">
	let {
		percent = 0,
		size = 120,
		strokeWidth = 8,
		color = '#10b981',
		trackColor = '#1e1e35',
		label = '',
		sublabel = ''
	}: {
		percent?: number;
		size?: number;
		strokeWidth?: number;
		color?: string;
		trackColor?: string;
		label?: string;
		sublabel?: string;
	} = $props();

	const radius = $derived((size - strokeWidth) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const dashOffset = $derived(circumference - (percent / 100) * circumference);
	const center = $derived(size / 2);
</script>

<div class="relative inline-flex items-center justify-center" style="width:{size}px;height:{size}px">
	<svg width={size} height={size} style="transform:rotate(-90deg);width:{size}px;height:{size}px">
		<!-- Track -->
		<circle
			cx={center}
			cy={center}
			r={radius}
			fill="none"
			stroke={trackColor}
			stroke-width={strokeWidth}
		/>
		<!-- Progress -->
		<circle
			cx={center}
			cy={center}
			r={radius}
			fill="none"
			stroke={color}
			stroke-width={strokeWidth}
			stroke-linecap="round"
			stroke-dasharray={circumference}
			stroke-dashoffset={dashOffset}
			style="transition: stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1);
			       filter: drop-shadow(0 0 6px {color}66)"
		/>
	</svg>
	<div class="absolute inset-0 flex flex-col items-center justify-center text-center">
		{#if label}
			<span class="font-bold text-white leading-none" style="font-size:{size * 0.18}px">{label}</span>
		{/if}
		{#if sublabel}
			<span class="leading-none mt-1" style="font-size:{size * 0.11}px;color:#64748b">{sublabel}</span>
		{/if}
	</div>
</div>

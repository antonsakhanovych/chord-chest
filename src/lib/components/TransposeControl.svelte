<!-- src/lib/components/TransposeControl.svelte -->
<script lang="ts">
	const MIN = -6;
	const MAX = 6;
	const POSITIONS = Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i);

	let { semitones, onChange }: { semitones: number; onChange: (n: number) => void } = $props();

	function positionPercent(n: number): number {
		return ((n - MIN) / (MAX - MIN)) * 100;
	}
</script>

<div class="flex items-center gap-3">
	<button
		onclick={() => onChange(Math.max(semitones - 1, MIN))}
		aria-label="Transpose down"
		class="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-paper-dark font-display text-lg font-bold text-ink hover:bg-mark-soft/30 focus:ring-2 focus:ring-mark focus:outline-none"
	>
		&minus;
	</button>

	<div class="relative h-11 flex-1">
		<!-- fret track: 6 evenly spaced vertical lines representing frets -->
		<div
			class="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 bg-ink-faint"
			aria-hidden="true"
		></div>
		{#each POSITIONS as n (n)}
			<button
				onclick={() => onChange(n)}
				aria-label={`Transpose to ${n > 0 ? `+${n}` : n}`}
				aria-pressed={n === semitones}
				class="absolute top-1/2 h-11 w-6 -translate-x-1/2 -translate-y-1/2 rounded-sm focus:ring-2 focus:ring-mark focus:outline-none"
				style={`left: ${positionPercent(n)}%;`}
			>
				<span class="mx-auto block h-3 w-0.5 bg-ink-faint" aria-hidden="true"></span>
			</button>
		{/each}
		<!-- capo clamp: slides to the current position -->
		<div
			class="pointer-events-none absolute top-1/2 h-6 w-4 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-mark shadow-sm motion-safe:transition-[left] motion-safe:duration-200"
			style={`left: ${positionPercent(semitones)}%;`}
			aria-hidden="true"
		></div>
	</div>

	<button
		onclick={() => onChange(Math.min(semitones + 1, MAX))}
		aria-label="Transpose up"
		class="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-paper-dark font-display text-lg font-bold text-ink hover:bg-mark-soft/30 focus:ring-2 focus:ring-mark focus:outline-none"
	>
		+
	</button>

	<span class="w-16 shrink-0 text-right font-display text-sm font-bold text-ink">
		key: {semitones > 0 ? `+${semitones}` : semitones}
	</span>
</div>

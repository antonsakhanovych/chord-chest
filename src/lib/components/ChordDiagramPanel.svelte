<!-- src/lib/components/ChordDiagramPanel.svelte -->
<script lang="ts">
	import ChordDiagram from './ChordDiagram.svelte';

	let { chords }: { chords: string[] } = $props();
</script>

{#if chords.length > 0}
	<div>
		<h2 class="font-display mb-2 text-sm font-bold tracking-wide text-ink-faint uppercase">Chords used</h2>
		<div class="flex flex-wrap gap-4">
			{#each chords as chord (chord)}
				<ChordDiagram name={chord} />
			{/each}
		</div>
	</div>
{/if}

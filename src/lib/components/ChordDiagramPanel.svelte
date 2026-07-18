<!-- src/lib/components/ChordDiagramPanel.svelte -->
<script lang="ts">
  import ChordDiagram from './ChordDiagram.svelte';

  let { chords }: { chords: string[] } = $props();
</script>

<div class="chord-panel">
  {#each chords as chord (chord)}
    <ChordDiagram name={chord} />
  {/each}
</div>

<style>
  .chord-panel {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 1rem 0;
  }
</style>

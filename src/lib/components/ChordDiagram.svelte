<!-- src/lib/components/ChordDiagram.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { SVGuitarChord } from 'svguitar';
  import { getChordShape } from '$lib/chords/chordShapes';

  let { name }: { name: string } = $props();
  let container: HTMLDivElement;

  onMount(() => {
    const shape = getChordShape(name);
    if (!shape) return;

    new SVGuitarChord(container)
      .configure({ title: name })
      .chord({ fingers: shape.fingers, barres: shape.barres, position: shape.baseFret })
      .draw();
  });
</script>

<div bind:this={container} class="chord-diagram"></div>

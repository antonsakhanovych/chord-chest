<!-- src/lib/components/TransposeControl.svelte -->
<script lang="ts">
  let { semitones, onChange }: { semitones: number; onChange: (n: number) => void } = $props();
</script>

<div class="transpose">
  <button onclick={() => onChange(Math.max(semitones - 1, -6))} aria-label="Transpose down">-</button>
  <span>{semitones > 0 ? `+${semitones}` : semitones}</span>
  <button onclick={() => onChange(Math.min(semitones + 1, 6))} aria-label="Transpose up">+</button>
</div>

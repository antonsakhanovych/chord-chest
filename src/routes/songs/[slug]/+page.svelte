<script lang="ts">
  import Song from '$lib/components/Song.svelte';
  import TransposeControl from '$lib/components/TransposeControl.svelte';
  import ChordDiagramPanel from '$lib/components/ChordDiagramPanel.svelte';
  import { extractChords } from '$lib/songs/extractChords';

  let { data } = $props();
  let semitones = $state(0);
  const transposedSong = $derived(data.song.transpose(semitones));
  const chordsUsed = $derived(extractChords(transposedSong));
</script>

{#if data.imageFilename}
  <img src={`/songs/${data.imageFilename}`} alt="" class="header-image" />
{/if}

<h1>{data.song.title}</h1>
{#if data.song.artist}
  <p class="artist">{data.song.artist}</p>
{/if}

<TransposeControl {semitones} onChange={(n) => (semitones = n)} />

<ChordDiagramPanel chords={chordsUsed} />

<Song song={transposedSong} />

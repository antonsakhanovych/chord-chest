<script lang="ts">
  import Song from '$lib/components/Song.svelte';
  import TransposeControl from '$lib/components/TransposeControl.svelte';

  let { data } = $props();
  let semitones = $state(0);
  const transposedSong = $derived(data.song.transpose(semitones));
</script>

{#if data.imageFilename}
  <img src={`/songs/${data.imageFilename}`} alt="" class="header-image" />
{/if}

<h1>{data.song.title}</h1>
{#if data.song.artist}
  <p class="artist">{data.song.artist}</p>
{/if}

<TransposeControl {semitones} onChange={(n) => (semitones = n)} />

<Song song={transposedSong} />

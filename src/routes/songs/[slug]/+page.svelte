<script lang="ts">
  import Song from '$lib/components/Song.svelte';

  let { data } = $props();
</script>

<h1>{data.song.title}</h1>
{#if data.song.artist}
  <p class="artist">{data.song.artist}</p>
{/if}

<Song song={data.song} />

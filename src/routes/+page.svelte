<script lang="ts">
  import { createSongSearch } from '$lib/songs/search';

  let { data } = $props();
  let query = $state('');
  const fuse = createSongSearch(data.songs);
  const results = $derived(query.trim() === '' ? data.songs : fuse.search(query).map((r) => r.item));
</script>

<h1 class="bg-paper text-ink font-display">Chord Chest</h1>

<input type="search" placeholder="Search songs or artists…" bind:value={query} />

<ul class="song-list">
  {#each results as song (song.slug)}
    <li>
      <a href={`/songs/${song.slug}`}>
        <span class="title">{song.title}</span>
        {#if song.artist}
          <span class="artist">{song.artist}</span>
        {/if}
      </a>
    </li>
  {/each}
</ul>

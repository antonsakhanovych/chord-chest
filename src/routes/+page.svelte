<script lang="ts">
  let { data } = $props();
</script>

<h1>Chord Chest</h1>

<ul class="song-list">
  {#each data.songs as song (song.slug)}
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

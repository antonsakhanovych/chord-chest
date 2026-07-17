<script lang="ts">
  import { ChordLyricsPair, Tag } from 'chordsheetjs';
  import type { Song } from 'chordsheetjs';

  let { song }: { song: Song } = $props();
</script>

<div class="song">
  {#each song.paragraphs as paragraph}
    {#each paragraph.lines as line}
      {#if line.items.length === 1 && line.items[0] instanceof Tag && line.items[0].name === 'comment'}
        <h3 class="section">{line.items[0].value}</h3>
      {:else if line.items.length > 0}
        <p class="line">
          {#each line.items as item}
            {#if item instanceof ChordLyricsPair}
              <span class="pair">
                {#if item.chords}<span class="chord">{item.chords}</span>{/if}
                <span class="lyric">{item.lyrics}</span>
              </span>
            {/if}
          {/each}
        </p>
      {/if}
    {/each}
  {/each}
</div>

<style>
  .pair {
    position: relative;
    display: inline-block;
  }
  .chord {
    position: absolute;
    top: -1.1em;
    left: 0;
    font-weight: bold;
    color: #2a8a4a;
    font-size: 0.85em;
  }
  .lyric {
    white-space: pre;
  }
  .line {
    margin: 1.4em 0 0.2em;
  }
</style>

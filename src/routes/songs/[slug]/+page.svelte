<script lang="ts">
  import Song from '$lib/components/Song.svelte';
  import TransposeControl from '$lib/components/TransposeControl.svelte';
  import ChordDiagramPanel from '$lib/components/ChordDiagramPanel.svelte';
  import { extractChords } from '$lib/songs/extractChords';
  import { downloadSongPdf } from '$lib/pdf/downloadPdf';
  import { normalizeArtist } from '$lib/songs/normalizeArtist';

  let { data } = $props();
  let semitones = $state(0);
  const transposedSong = $derived(data.song.transpose(semitones));
  const chordsUsed = $derived(extractChords(transposedSong));
  let downloading = $state(false);

  async function handleDownload() {
    downloading = true;
    try {
      await downloadSongPdf(transposedSong, data.slug);
    } finally {
      downloading = false;
    }
  }
</script>

{#if data.imageFilename}
  <img src={`/songs/${data.imageFilename}`} alt="" class="header-image" />
{/if}

<h1>{data.song.title}</h1>
{#if data.song.artist}
  <p class="artist">{normalizeArtist(data.song.artist)}</p>
{/if}

<TransposeControl {semitones} onChange={(n) => (semitones = n)} />

<ChordDiagramPanel chords={chordsUsed} />

<button onclick={handleDownload} disabled={downloading}>
  {downloading ? 'Generating PDF…' : 'Download PDF'}
</button>

<Song song={transposedSong} />

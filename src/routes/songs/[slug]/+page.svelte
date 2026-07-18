<script lang="ts">
	import Song from '$lib/components/Song.svelte';
	import TransposeControl from '$lib/components/TransposeControl.svelte';
	import ChordDiagramPanel from '$lib/components/ChordDiagramPanel.svelte';
	import { downloadSongPdf } from '$lib/pdf/downloadPdf';
	import type { PdfTheme } from '$lib/pdf/toPdfDocDefinition';
	import { extractChords } from '$lib/songs/extractChords';
	import { normalizeArtist } from '$lib/songs/normalizeArtist';

	let { data } = $props();
	let semitones = $state(0);
	const transposedSong = $derived(data.song.transpose(semitones));
	const chordsUsed = $derived(extractChords(transposedSong));

	let downloading = $state(false);
	let pdfTheme: PdfTheme = $state('styled');

	async function handleDownload() {
		downloading = true;
		try {
			await downloadSongPdf(transposedSong, data.slug, pdfTheme);
		} finally {
			downloading = false;
		}
	}
</script>

<div class="min-h-screen bg-paper text-ink">
	<div class="mx-auto max-w-2xl px-4 py-8 sm:px-6">
		<a href="/" class="font-body text-sm text-ink-faint hover:text-mark">&larr; Chord Chest</a>

		<header class="relative mt-4 rounded-sm bg-paper-dark px-5 py-4 shadow-sm">
			<span class="absolute top-2 bottom-2 left-0 w-1.5 rounded-r-sm bg-mark" aria-hidden="true"></span>
			{#if data.imageFilename}
				<img
					src={`/songs/${data.imageFilename}`}
					alt=""
					class="mb-3 h-40 w-full rounded-sm object-cover"
				/>
			{/if}
			<h1 class="font-display text-2xl font-bold sm:text-3xl">{data.song.title}</h1>
			{#if data.song.artist}
				<p class="font-body text-ink-faint italic">{normalizeArtist(data.song.artist)}</p>
			{/if}
		</header>

		<div class="mt-4">
			<TransposeControl {semitones} onChange={(n) => (semitones = n)} />
		</div>

		<div class="mt-6 rounded-sm bg-paper-dark/40 p-4 sm:p-6">
			<Song song={transposedSong} />
		</div>

		<div class="mt-6">
			<ChordDiagramPanel chords={chordsUsed} />
		</div>

		<div class="mt-6 flex flex-wrap items-center gap-2">
			<label class="flex items-center gap-2">
				<span class="font-body text-sm text-ink-faint">PDF style:</span>
				<select
					bind:value={pdfTheme}
					class="rounded-sm border border-ink-faint bg-paper-dark px-2 py-2 font-body text-sm text-ink focus:ring-2 focus:ring-mark focus:outline-none"
				>
					<option value="styled">Styled</option>
					<option value="print">Print-friendly (black &amp; white)</option>
				</select>
			</label>
			<button
				onclick={handleDownload}
				disabled={downloading}
				class="font-display rounded-sm bg-mark px-4 py-2 font-bold text-paper transition-colors hover:bg-mark-soft focus:ring-2 focus:ring-mark focus:outline-none disabled:opacity-60"
			>
				{downloading ? 'Generating PDF…' : 'Download PDF'}
			</button>
		</div>
	</div>
</div>

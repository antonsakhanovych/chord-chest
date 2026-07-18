<script lang="ts">
	import { ChordLyricsPair, Tag } from 'chordsheetjs';
	import type { Song } from 'chordsheetjs';

	let { song }: { song: Song } = $props();

	function escapeLyricHtml(text: string): string {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/«/g, '&laquo;')
			.replace(/»/g, '&raquo;');
	}
</script>

<div class="font-display text-ink overflow-x-auto">
	{#each song.paragraphs as paragraph}
		{#each paragraph.lines as line}
			{#if line.items.length === 1 && line.items[0] instanceof Tag && line.items[0].name === 'comment'}
				<h3 class="mt-4 mb-1 text-sm font-bold tracking-wide text-ink-faint uppercase">{line.items[0].value}</h3>
			{:else if line.items.length > 0}
				<p class="mt-6 mb-0.5 border-b border-ink-faint/25 pb-1 leading-[1.7em]">
					{#each line.items as item}
						{#if item instanceof ChordLyricsPair}
							<span class="relative inline-block">
								{#if item.chords}<span class="absolute -top-[1.1em] left-0 text-[0.85em] font-bold text-mark">{item.chords}</span>{/if}
								<span class="whitespace-pre">{@html escapeLyricHtml(item.lyrics ?? '')}</span>
							</span>
						{/if}
					{/each}
				</p>
			{/if}
		{/each}
	{/each}
</div>

<script lang="ts">
	import { createSongSearch } from '$lib/songs/search';
	import { resolve } from '$app/paths';

	let { data } = $props();
	let query = $state('');
	const fuse = createSongSearch(data.songs);
	const results = $derived(
		query.trim() === '' ? data.songs : fuse.search(query).map((r) => r.item)
	);
</script>

<div class="min-h-screen bg-paper text-ink">
	<div class="mx-auto max-w-2xl px-4 py-8 sm:px-6">
		<h1 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">Chord Chest</h1>

		<label class="mt-6 block">
			<span class="font-body text-sm text-ink-faint italic">search songs or artists</span>
			<input
				type="search"
				placeholder="Type to search…"
				bind:value={query}
				class="mt-1 w-full rounded-sm border border-ink-faint bg-paper-dark px-3 py-2 font-body text-ink placeholder:text-ink-faint focus:border-mark focus:ring-2 focus:ring-mark focus:outline-none"
			/>
		</label>

		<ul class="mt-6 flex flex-col gap-3">
			{#each results as song (song.slug)}
				<li>
					<a
						href={resolve('/songs/[slug]', { slug: song.slug })}
						class="relative block rounded-sm bg-paper-dark py-3 pr-4 pl-5 shadow-sm transition-colors hover:bg-mark-soft/20 focus:ring-2 focus:ring-mark focus:outline-none"
					>
						<span
							class="absolute top-2 bottom-2 left-0 w-1.5 rounded-r-sm bg-mark"
							aria-hidden="true"
						></span>
						<span class="block font-display font-bold text-ink">{song.title}</span>
						{#if song.artist}
							<span class="block font-body text-sm text-ink-faint italic">{song.artist}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</div>

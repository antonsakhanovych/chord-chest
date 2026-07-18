import type { Song } from 'chordsheetjs';
import { toPdfDocDefinition, type PdfTheme } from './toPdfDocDefinition';
import { extractChords } from '$lib/songs/extractChords';
import { chordDiagramToPng } from './chordDiagramImage';
import { loadVfs, fonts } from './vfsFonts';

let fontsRegistered = false;

async function ensurePdfMake() {
	const pdfMakeModule = await import('pdfmake/build/pdfmake');
	// @types/pdfmake declares this module as pure named exports (createPdf, fonts, ...) with
	// no `default` — confirmed empirically too (Node's require() of the UMD bundle returns the
	// pdfMake instance directly). The `unknown` cast keeps a runtime fallback for bundlers that
	// wrap CJS modules in `.default` without fighting the (correctly) non-overlapping static types.
	const pdfMake =
		(pdfMakeModule as unknown as { default?: typeof pdfMakeModule }).default ?? pdfMakeModule;

	if (!fontsRegistered) {
		// pdfmake 0.3.x has no settable `vfs` property — createPdf() reads from an internal
		// `virtualfs` populated via addFontContainer()/addVirtualFileSystem(), not a `vfs` field.
		const vfs = await loadVfs();
		(
			pdfMake as unknown as {
				addFontContainer: (container: { vfs: typeof vfs; fonts: typeof fonts }) => void;
			}
		).addFontContainer({
			vfs,
			fonts
		});
		fontsRegistered = true;
	}

	return pdfMake as unknown as {
		createPdf: (docDefinition: ReturnType<typeof toPdfDocDefinition>) => {
			download: (filename: string) => Promise<void>;
		};
	};
}

export async function downloadSongPdf(
	song: Song,
	filenameSlug: string,
	theme: PdfTheme = 'styled'
): Promise<void> {
	const pdfMake = await ensurePdfMake();
	const docDefinition = toPdfDocDefinition(song, theme);

	const diagramColor = theme === 'print' ? '#000000' : '#2a2420';
	const borderColor = theme === 'print' ? '#999999' : '#5c5242';
	const chordNames = extractChords(song);
	const images = await Promise.all(chordNames.map((name) => chordDiagramToPng(name, diagramColor)));
	const diagramImages = images.filter((img): img is string => !!img);

	if (diagramImages.length > 0) {
		(docDefinition.content as unknown[]).push({
			text: 'Chords used',
			bold: true,
			margin: [0, 16, 0, 6],
			font: 'Mono'
		});
		const DIAGRAM_WIDTH = 75;
		const DIAGRAMS_PER_ROW = 5;
		for (let i = 0; i < diagramImages.length; i += DIAGRAMS_PER_ROW) {
			const row = diagramImages.slice(i, i + DIAGRAMS_PER_ROW);
			(docDefinition.content as unknown[]).push({
				columns: row.map((img) => ({
					// pdfmake treats a column with no `width` as a star column (fills leftover row
					// space evenly) — confirmed in columnCalculator.js's isStarColumn(). Without this,
					// a short trailing row stretches its cards apart instead of packing them left.
					width: 'auto',
					table: {
						body: [[{ image: img, width: DIAGRAM_WIDTH, border: [true, true, true, true] }]]
					},
					layout: {
						hLineColor: () => borderColor,
						vLineColor: () => borderColor,
						hLineWidth: () => 0.75,
						vLineWidth: () => 0.75,
						paddingLeft: () => 6,
						paddingRight: () => 6,
						paddingTop: () => 6,
						paddingBottom: () => 6
					}
				})),
				columnGap: 10,
				margin: [0, 0, 0, 10]
			});
		}
	}

	await pdfMake.createPdf(docDefinition).download(`${filenameSlug}-${theme}.pdf`);
}

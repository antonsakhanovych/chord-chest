import { getChordShape } from '$lib/chords/chordShapes';

// Fixed raster frame every diagram fits into, regardless of its own natural aspect ratio —
// keeps every card in the "Chords used" grid the same size instead of wobbling per chord.
// Rasterized larger than the ~110pt embed width for crisper print output.
const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 240;

function parseViewBox(svgString: string): { width: number; height: number } | null {
	const match = svgString.match(/viewBox="[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)"/);
	if (!match) return null;
	return { width: parseFloat(match[1]), height: parseFloat(match[2]) };
}

export async function chordDiagramToPng(name: string, color = '#2a2420'): Promise<string | null> {
	const shape = getChordShape(name);
	if (!shape) return null;

	const container = document.createElement('div');
	container.style.position = 'fixed';
	container.style.left = '-9999px';
	document.body.appendChild(container);

	const { SVGuitarChord } = await import('svguitar');
	new SVGuitarChord(container)
		.configure({ title: name, color, backgroundColor: 'none' })
		.chord({ fingers: shape.fingers, barres: shape.barres, position: shape.baseFret })
		.draw();

	const svgEl = container.querySelector('svg');
	if (!svgEl) {
		document.body.removeChild(container);
		return null;
	}

	const svgString = new XMLSerializer().serializeToString(svgEl);
	// The SVG svguitar produces has no explicit width/height (only a viewBox), so an <img>'s
	// "natural" size for it is a browser-inferred fallback — confirmed inconsistent across
	// desktop/mobile rendering engines. Reading the viewBox directly instead gives the same,
	// deterministic dimensions on every device.
	const viewBox = parseViewBox(svgString);
	const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
	const url = URL.createObjectURL(svgBlob);

	try {
		return await new Promise<string>((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = CANVAS_WIDTH;
				canvas.height = CANVAS_HEIGHT;
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					reject(new Error('Canvas 2D context unavailable'));
					return;
				}

				const naturalWidth = viewBox?.width ?? img.naturalWidth ?? CANVAS_WIDTH;
				const naturalHeight = viewBox?.height ?? img.naturalHeight ?? CANVAS_HEIGHT;
				const scale = Math.min(CANVAS_WIDTH / naturalWidth, CANVAS_HEIGHT / naturalHeight);
				const drawWidth = naturalWidth * scale;
				const drawHeight = naturalHeight * scale;
				const offsetX = (CANVAS_WIDTH - drawWidth) / 2;
				const offsetY = (CANVAS_HEIGHT - drawHeight) / 2;

				ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
				resolve(canvas.toDataURL('image/png'));
			};
			img.onerror = () => reject(new Error(`Failed to rasterize chord diagram for ${name}`));
			img.src = url;
		});
	} finally {
		URL.revokeObjectURL(url);
		document.body.removeChild(container);
	}
}

// src/lib/pdf/chordDiagramImage.ts
import { getChordShape } from '$lib/chords/chordShapes';

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
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    return await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 200;
        canvas.height = img.height || 200;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0);
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

# Chord Chest

A personal songbook: ChordPro lyrics with live chord transposition, fretboard diagrams, fuzzy search, and print-ready PDF export. No server, just static files.

**[chords.antonsakhanovych.com →](https://chords.antonsakhanovych.com)**

## Stack

SvelteKit + TypeScript · [chordsheetjs](https://github.com/martijnversluis/ChordSheetJS) for parsing · [svguitar](https://github.com/omnibrain/svguitar) for diagrams · [pdfmake](https://github.com/bpampuch/pdfmake) for PDF export · Tailwind CSS

## Adding a song

Drop a `.cho` file (ChordPro format) into `songs/`. Chords go inline as `[Am]` right before the syllable they belong to; section headers are `{comment: ...}` directives.

## Local development

```bash
npm install
npm run dev
```

```bash
npm run check   # typecheck
npm run lint    # eslint + prettier
npm run test    # vitest
npm run build   # static build to build/
```

## Deploy

Pushes to `mainline` build and deploy to GitHub Pages automatically via `.github/workflows/build.yml`.

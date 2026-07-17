import guitarChordsJson from '@tombatossals/chords-db/lib/guitar.json';

interface GuitarChordPosition {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
}

interface GuitarChordEntry {
  suffix: string;
  positions: GuitarChordPosition[];
}

interface GuitarChordsDb {
  chords: Record<string, GuitarChordEntry[]>;
}

const guitarChords = guitarChordsJson as unknown as GuitarChordsDb;

const SUFFIX_MAP: Record<string, string> = {
  '': 'major',
  m: 'minor',
  '7': '7',
  m7: 'm7',
  maj7: 'maj7',
  dim: 'dim',
  aug: 'aug',
  sus2: 'sus2',
  sus4: 'sus4'
};

// Maps a parsed root note to the canonical key used by chords-db's `keys`
// list, which prefers sharps for C#/F# and flats for Eb/Ab/Bb.
const KEY_ALIASES: Record<string, string> = {
  Db: 'C#',
  'D#': 'Eb',
  Gb: 'F#',
  'G#': 'Ab',
  'A#': 'Bb'
};

export interface ChordShape {
  fingers: Array<[number, number | 'x', string?]>;
  barres: Array<{ fromString: number; toString: number; fret: number }>;
  baseFret: number;
}

function parseChordName(name: string): { key: string; suffix: string } | null {
  const match = name.match(/^([A-G])(#|b)?(.*)$/);
  if (!match) return null;
  const [, letter, accidental, rawSuffix] = match;
  const rawKey = `${letter}${accidental ?? ''}`;
  const key = KEY_ALIASES[rawKey] ?? rawKey;
  const suffix = SUFFIX_MAP[rawSuffix];
  return suffix ? { key, suffix } : null;
}

function buildFingers(position: GuitarChordPosition): ChordShape['fingers'] {
  const stringCount = position.frets.length;
  const fingers: ChordShape['fingers'] = [];

  for (let index = 0; index < stringCount; index += 1) {
    const stringNumber = stringCount - index;
    const fret = position.frets[index];
    if (fret === -1) {
      fingers.push([stringNumber, 'x']);
      continue;
    }
    const fingerNumber = position.fingers[index];
    fingers.push(fingerNumber ? [stringNumber, fret, String(fingerNumber)] : [stringNumber, fret]);
  }

  return fingers;
}

function buildBarres(position: GuitarChordPosition): ChordShape['barres'] {
  const stringCount = position.frets.length;

  return position.barres.map((fret) => {
    const strings = position.frets
      .map((fretValue, index) => ({ fretValue, stringNumber: stringCount - index }))
      .filter(({ fretValue }) => fretValue === fret)
      .map(({ stringNumber }) => stringNumber);

    return {
      fromString: Math.max(...strings),
      toString: Math.min(...strings),
      fret
    };
  });
}

export function getChordShape(name: string): ChordShape | undefined {
  const parsed = parseChordName(name);
  if (!parsed) return undefined;

  const objectKey = parsed.key.replace('#', 'sharp');
  const entries = guitarChords.chords[objectKey];
  const entry = entries?.find((chord) => chord.suffix === parsed.suffix);
  const position = entry?.positions[0];
  if (!position) return undefined;

  return {
    fingers: buildFingers(position),
    barres: buildBarres(position),
    baseFret: position.baseFret
  };
}

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

const guitarChords: GuitarChordsDb = guitarChordsJson;

const SUFFIX_MAP: Record<string, string> = {
	'': 'major',
	m: 'minor',
	'7': '7',
	m7: 'm7',
	maj7: 'maj7',
	dim: 'dim',
	dim7: 'dim7',
	aug: 'aug',
	aug7: 'aug7',
	aug9: 'aug9',
	sus2: 'sus2',
	sus4: 'sus4',
	'7sus4': '7sus4',
	'6': '6',
	m6: 'm6',
	'69': '69',
	m69: 'm69',
	'9': '9',
	m9: 'm9',
	'9b5': '9b5',
	'9#11': '9#11',
	'11': '11',
	m11: 'm11',
	'13': '13',
	'7b5': '7b5',
	'7b9': '7b9',
	'7#9': '7#9',
	'7alt': 'alt',
	add9: 'add9',
	madd9: 'madd9',
	maj9: 'maj9',
	maj11: 'maj11',
	maj13: 'maj13',
	maj7b5: 'maj7b5',
	'maj7#5': 'maj7#5',
	m7b5: 'm7b5',
	mmaj7: 'mmaj7',
	mmaj9: 'mmaj9',
	mmaj11: 'mmaj11',
	mmaj7b5: 'mmaj7b5'
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

// Infers each barre's string span from the finger shared by 2+ strings at that fret, rather than just
// matching fret value (a separately-fingered note can coincidentally land on the same fret and isn't
// part of the barre). Verified against the full chords-db dataset (positions[0], every suffix, 221 barre
// instances): this produces a self-consistent span (all included strings share one finger) in every case,
// whereas matching by fret value alone over-widens the span in ~11% of instances (25/221).
function buildBarres(position: GuitarChordPosition): ChordShape['barres'] {
	const stringCount = position.frets.length;

	return position.barres.map((fret) => {
		const matches = position.frets
			.map((fretValue, index) => ({
				fretValue,
				stringNumber: stringCount - index,
				finger: position.fingers[index]
			}))
			.filter(({ fretValue }) => fretValue === fret);

		const stringsByFinger = new Map<number, number[]>();
		for (const { stringNumber, finger } of matches) {
			const strings = stringsByFinger.get(finger) ?? [];
			strings.push(stringNumber);
			stringsByFinger.set(finger, strings);
		}

		let barreStrings: number[] | undefined;
		for (const strings of stringsByFinger.values()) {
			if (strings.length >= 2 && (!barreStrings || strings.length > barreStrings.length)) {
				barreStrings = strings;
			}
		}
		const strings = barreStrings ?? matches.map(({ stringNumber }) => stringNumber);

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

import robotoMonoUrl from '@expo-google-fonts/roboto-mono/400Regular/RobotoMono_400Regular.ttf?url';
import notoSerifRegularUrl from '@expo-google-fonts/noto-serif/400Regular/NotoSerif_400Regular.ttf?url';
import notoSerifItalicUrl from '@expo-google-fonts/noto-serif/400Regular_Italic/NotoSerif_400Regular_Italic.ttf?url';

const FONT_URLS: Record<string, string> = {
  'RobotoMono-Regular.ttf': robotoMonoUrl,
  'Body-Regular.ttf': notoSerifRegularUrl,
  'Body-Italic.ttf': notoSerifItalicUrl
};

export const fonts = {
  Mono: {
    normal: 'RobotoMono-Regular.ttf',
    bold: 'RobotoMono-Regular.ttf',
    italics: 'RobotoMono-Regular.ttf',
    bolditalics: 'RobotoMono-Regular.ttf'
  },
  Body: {
    normal: 'Body-Regular.ttf',
    bold: 'Body-Regular.ttf',
    italics: 'Body-Italic.ttf',
    bolditalics: 'Body-Italic.ttf'
  }
};

async function fetchAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export async function loadVfs(): Promise<Record<string, string>> {
  const entries = await Promise.all(
    Object.entries(FONT_URLS).map(async ([name, url]) => [name, await fetchAsBase64(url)] as const)
  );
  return Object.fromEntries(entries);
}

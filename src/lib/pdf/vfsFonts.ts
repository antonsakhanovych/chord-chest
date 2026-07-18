const FONT_URLS: Record<string, string> = {
  'RobotoMono-Regular.ttf': '/fonts/RobotoMono-Regular.ttf',
  'Body-Regular.ttf': '/fonts/Body-Regular.ttf',
  'Body-Italic.ttf': '/fonts/Body-Italic.ttf'
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

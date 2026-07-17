export function getSongFiles(): Record<string, string> {
  return import.meta.glob('/songs/*.cho', {
    query: '?raw',
    import: 'default',
    eager: true
  }) as Record<string, string>;
}

export function slugFromPath(path: string): string {
  return path.split('/').pop()!.replace(/\.cho$/, '');
}

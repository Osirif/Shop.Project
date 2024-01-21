export function compileIdsToRemove(data: string | string[]): string[] {
  if (typeof data === 'string') return [data]
  return data
}

export function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getRandomSubset<T>(items: readonly T[], size: number): T[] {
  if (items.length <= size) return shuffleArray(items);
  return shuffleArray(items).slice(0, size);
}

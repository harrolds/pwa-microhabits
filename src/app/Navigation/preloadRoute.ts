export async function preloadRoute<T>(loader: () => Promise<T>) {
  return loader()
}


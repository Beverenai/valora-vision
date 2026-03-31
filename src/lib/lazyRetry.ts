/**
 * Wrap a dynamic import so that on chunk-load failure (stale deploy)
 * we do ONE hard reload to pick up the new manifest.
 */
export function lazyRetry<T>(factory: () => Promise<T>): Promise<T> {
  return factory().catch((err: unknown) => {
    const key = "chunk_retry";
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      window.location.reload();
      return new Promise<T>(() => {});
    }
    sessionStorage.removeItem(key);
    throw err;
  });
}

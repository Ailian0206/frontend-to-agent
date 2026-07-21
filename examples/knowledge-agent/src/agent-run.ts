export async function invokeWithTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs = 45_000,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await operation(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

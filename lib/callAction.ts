// Server Actions are compiled to a per-deploy hashed ID. If a client has a
// page open across a deploy and then invokes an action, the browser calls an
// ID the new deployment has never heard of, and Next.js throws
// UnrecognizedActionError ("... was not found on the server") instead of
// running it. Every other thrown error is a genuine bug and should keep
// propagating to the nearest error boundary exactly as before.
export const STALE_BUILD_MESSAGE = 'This page is out of date (the site was updated while it was open). Please refresh the page and try again.'

export function isStaleServerActionError(err: unknown): boolean {
  return err instanceof Error && /was not found on the server/i.test(err.message)
}

export async function callAction<T extends { error?: string }>(action: () => Promise<T>): Promise<T> {
  try {
    return await action()
  } catch (err) {
    if (isStaleServerActionError(err)) return { error: STALE_BUILD_MESSAGE } as T
    throw err
  }
}

export async function loadPageData<T>(fetcher: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    return { ok: true, data: await fetcher() }
  } catch (err) {
    if (isStaleServerActionError(err)) return { ok: false, error: STALE_BUILD_MESSAGE }
    throw err
  }
}

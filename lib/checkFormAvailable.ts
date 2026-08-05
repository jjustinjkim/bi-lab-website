// A deleted/unpublished Google Form still resolves docs.google.com fine,
// but the actual viewform response is a real Google-served "Page Not
// Found" (HTTP 404, its own "Sorry, the file you have requested does not
// exist" page) -- confirmed directly against both this site's embedded
// forms, not assumed. EmbedFrame can't detect this itself (a cross-origin
// iframe's load event fires the same for a 200 or a 404), so without this,
// a dead form silently embeds Google's own branded error/ad page inside
// ours. Checked once at build time since these pages are static; a form
// that goes down between deploys won't be caught until the next one, same
// as everything else on this data-driven static site.
export async function isFormAvailable(formUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    // Deliberately the default cache behavior (fetched once at build time,
    // baked into the static page), not no-store -- a no-store fetch makes
    // Next.js treat the whole route as dynamic, turning this into a live
    // Google Forms request on every single page view instead of the
    // one-time build-time check this is meant to be.
    const res = await fetch(formUrl, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    // A network hiccup in the build environment shouldn't take down the
    // build or hide a form that's actually fine -- fail open, same as
    // before this check existed.
    return true;
  }
}

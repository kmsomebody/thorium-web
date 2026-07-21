/**
 * Rewrites an absolute external URL through the local proxy API to avoid CORS issues.
 * Relative URLs and non-http(s) URLs are returned unchanged.
 */
export const proxyUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return `/api/proxy?url=${ encodeURIComponent(url) }`;
    }
  } catch {
    // relative or invalid — return as-is
  }

  return url;
}

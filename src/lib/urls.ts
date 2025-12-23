export function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    const url = new URL(envUrl);
    return url.origin.replace(/\/+$/, "");
  } catch {
    return `https://${envUrl.replace(/^(https?:\/\/)/, "")}`.replace(/\/+$/, "");
  }
}

export function toAbsoluteUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  const site = getSiteUrl();
  const normalized = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${site}${normalized}`;
}

export function canonicalFor(path: string) {
  return toAbsoluteUrl(path) ?? getSiteUrl();
}

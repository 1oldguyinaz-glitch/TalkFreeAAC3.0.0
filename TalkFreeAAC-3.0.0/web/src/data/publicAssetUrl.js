function isExternalOrEmbeddedUrl(value) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value);
}

export function publicAssetUrl(path, baseUrl = import.meta.env?.BASE_URL ?? './') {
  if (path == null || path === '') return path;

  const value = String(path);
  if (isExternalOrEmbeddedUrl(value)) return value;

  const base = String(baseUrl || './');
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = value.replace(/^\.?\/+/, '');
  return `${normalizedBase}${normalizedPath}`;
}

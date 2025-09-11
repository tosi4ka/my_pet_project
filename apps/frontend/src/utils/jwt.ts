export function parseJwt(token: string): { exp?: number } | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const payload = JSON.parse(atob(base64));
    return payload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

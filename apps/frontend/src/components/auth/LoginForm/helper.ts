import { getSession } from 'next-auth/react';

export async function waitForSession(maxMs = 5000, interval = 150) {
  const start = Date.now();
  let s = await getSession();
  if (s?.user?.id) return s;
  while (Date.now() - start < maxMs) {
    await new Promise((r) => setTimeout(r, interval));
    s = await getSession();
    if (s?.user?.id) return s;
  }
  return s;
}

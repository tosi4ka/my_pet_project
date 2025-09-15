import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function normalizePhoneToE164(raw: string): string {
  const pn = parsePhoneNumberFromString(raw);
  if (!pn || !pn.isValid()) {
    throw new Error('Invalid phone number');
  }
  return pn.number;
}

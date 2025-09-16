import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { normalizePhoneToE164 } from '../../utils/phone.util';

type PhoneInput = {
  phone?: string;
  phoneNumber?: string;
  [key: string]: unknown;
};

@Injectable()
export class NormalizePhonePipe implements PipeTransform {
  transform(value: unknown): string | PhoneInput {
    if (value && typeof value === 'object') {
      const obj = value as PhoneInput;
      const phoneRaw = obj.phone ?? obj.phoneNumber ?? null;

      if (!phoneRaw) return value as PhoneInput;

      try {
        const phone = normalizePhoneToE164(String(phoneRaw));
        return { ...obj, phone };
      } catch {
        throw new BadRequestException('Invalid phone number');
      }
    }

    if (typeof value === 'string') {
      try {
        return normalizePhoneToE164(value);
      } catch {
        throw new BadRequestException('Invalid phone number');
      }
    }

    return value as PhoneInput;
  }
}

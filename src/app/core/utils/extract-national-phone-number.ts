import {parsePhoneNumberWithError} from 'libphonenumber-js';

export function extractNationalPhoneNumber(phone: string): string {
  try {
    const parsedNumber = parsePhoneNumberWithError(phone);
    return parsedNumber.nationalNumber;
  } catch (error) {
    return phone;
  }
}

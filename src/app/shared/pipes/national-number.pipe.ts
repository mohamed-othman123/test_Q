import {Pipe, PipeTransform} from '@angular/core';
import {parsePhoneNumber} from 'libphonenumber-js';

@Pipe({
    name: 'nationalNumber',
    standalone: false
})
export class NationalNumberPipe implements PipeTransform {
  transform(phoneNumber: string | null): string {
    if (!phoneNumber) {
      return '';
    }

    try {
      const parsedNumber = parsePhoneNumber(phoneNumber);
      const nationalNumber = parsedNumber.nationalNumber;

      return nationalNumber.startsWith('0')
        ? nationalNumber
        : `0${nationalNumber}`;
    } catch (error) {
      return phoneNumber.startsWith('0') ? phoneNumber : `0${phoneNumber}`;
    }
  }
}

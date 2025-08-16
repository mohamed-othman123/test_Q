import {Pipe, PipeTransform} from '@angular/core';
import moment from 'moment-hijri';

@Pipe({
    name: 'hijriDate',
    standalone: false
})
export class HijriDatePipe implements PipeTransform {
  transform(date: Date, language: string): string {
    const locale = language === 'ar' ? 'ar-SA' : 'en';
    return moment(date).locale(locale).format('iMMMM ، iYYYY');
  }
}

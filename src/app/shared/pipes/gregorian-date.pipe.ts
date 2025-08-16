import {Pipe, PipeTransform} from '@angular/core';
import moment from 'moment-hijri';

@Pipe({
    name: 'gregorianDate',
    standalone: false
})
export class GregorianDatePipe implements PipeTransform {
  transform(date: Date, language: string): string {
    const locale = language === 'ar' ? 'ar-SA' : 'en';
    const startDate = moment(date).startOf('iMonth');
    const endDate = moment(date).endOf('iMonth');

    const startMonth = startDate.locale(locale).format('MMMM');
    const startYear = startDate.format('YYYY');

    if (startDate.format('M') !== endDate.format('M')) {
      const endMonth = endDate.locale(locale).format('MMMM');
      const endYear = endDate.format('YYYY');

      return startYear !== endYear
        ? `${startMonth} ${startYear} - ${endMonth} ${endYear}`
        : `${startMonth} - ${endMonth} ${startYear}`;
    }

    return `${startMonth} ${startYear}`;
  }
}

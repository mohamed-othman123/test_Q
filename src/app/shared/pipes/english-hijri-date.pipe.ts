import {Pipe, PipeTransform} from '@angular/core';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';
import moment from 'moment-hijri';

@Pipe({
    name: 'englishHijriDate',
    standalone: false
})
export class EnglishHijriDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const iso = dateToGregorianIsoString(value as string);

    moment.locale('en');

    return moment(iso).locale('en').format('iDD iMMMM iYYYY');
  }
}

import {Pipe, PipeTransform} from '@angular/core';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';
import moment from 'moment-hijri';

@Pipe({
  name: 'arabicHijriDate',
  standalone: false,
})
export class ArabicHijriDatePipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    format: string = 'iDD iMMMM iYYYY',
  ): string | null {
    if (!value) {
      return null;
    }

    const iso = dateToGregorianIsoString(value as string);

    moment.locale('ar-SA');

    return moment(iso).locale('ar-SA').format(format);
  }
}

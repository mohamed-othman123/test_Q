import {Pipe, PipeTransform} from '@angular/core';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';
import moment from 'moment';

@Pipe({
  name: 'arabicMonthDate',
  standalone: false,
})
export class ArabicMonthDatePipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    includeTime: boolean = false,
    format: string = 'dddd DD MMMM YYYY',
    ...args: unknown[]
  ): unknown {
    if (!value) return;
    const newValue = dateToGregorianIsoString(value as string);
    moment.locale('ar'); // Set moment to Arabic locale

    if (includeTime) {
      return moment(newValue)
        .locale('ar')
        .format(format + ' - hh:mm:ss A');
    }

    return moment(newValue).locale('ar').format(format);
  }
}

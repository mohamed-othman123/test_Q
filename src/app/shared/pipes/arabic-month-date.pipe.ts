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
    ...args: unknown[]
  ): unknown {
    if (!value) return;
    const newValue = dateToGregorianIsoString(value as string);
    moment.locale('ar'); // Set moment to Arabic locale

    if (includeTime) {
      return moment(newValue)
        .locale('ar')
        .format('dddd DD MMMM YYYY - hh:mm:ss A');
    }

    return moment(newValue).locale('ar').format('dddd DD MMMM YYYY');
  }
}

import {Pipe, PipeTransform} from '@angular/core';
import {ReservedBookings} from '@dashboard/models/dashboard.model';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {islamicToGregorian} from '@shared/components/date-picker/helper/date-helper';

@Pipe({
    name: 'reservedDate',
    standalone: false
})
export class ReservedDatePipe implements PipeTransform {
  transform(
    date: NgbDateStruct,
    reservedBookings: ReservedBookings[],
    currentMonth: number,
    dateType: 'islamic' | 'gregorian',
  ): unknown {
    if (dateType === 'gregorian' && date.month === currentMonth) {
      // convert the api response to array of days and check if the current day exists in it
      return Object.keys(reservedBookings).includes(String(date.day));
    } else if (dateType === 'islamic' && date.month === currentMonth) {
      const currentGregorianDay = +islamicToGregorian(date).split('/')[2];

      return Object.keys(reservedBookings).includes(
        String(currentGregorianDay),
      );
    }
    return;
  }
}

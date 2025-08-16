import {AbstractControl, FormControl} from '@angular/forms';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment-hijri';
import {format} from 'date-fns';

export function toNgbDateStruct(
  date: Date | NgbDateStruct | string | null,
): NgbDateStruct | null {
  if (date === null) {
    return null;
  }
  if (typeof date === 'string') {
    date = new Date(date.split('T')[0]);
  }
  if (date instanceof Date) {
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
    };
  }
  return date;
}

export function toNgbDateStructControl(
  date: FormControl<Date | string | null>,
): FormControl<NgbDateStruct | null> {
  return new FormControl(toNgbDateStruct(date.value));
}

export function convertDateTo(
  date: NgbDateStruct,
  calendarType: 'gregorian' | 'islamic',
): NgbDateStruct {
  let convertedDate: string;
  if (calendarType === 'gregorian') {
    convertedDate = islamicToGregorian(date);
  } else {
    convertedDate = gregorianToIslamic(date);
  }

  return {
    year: parseInt(convertedDate.split('/')[0]),
    month: parseInt(convertedDate.split('/')[1]),
    day: parseInt(convertedDate.split('/')[2]),
  };
}

export function gregorianToIslamic(gregorian: NgbDateStruct) {
  const dateStr = `${gregorian?.year}/${String(gregorian?.month).padStart(2, '0')}/${String(gregorian?.day).padStart(2, '0')}`;
  const m = moment(dateStr, 'YYYY/MM/DD').locale('en-US');
  return m.format('iYYYY/iMM/iDD');
}

export function islamicToGregorian(islamic: NgbDateStruct) {
  const m = moment(
    `${islamic.year}/${islamic.month}/${islamic.day}`,
    'iYYYY/iMM/iDD',
  ).locale('en-US');
  return m.format('YYYY/MM/DD');
}

export function stringifyDate(date: NgbDateStruct) {
  return `${date.year}/${date.month}/${date.day}`;
}

export function isDateGregorian(date: NgbDateStruct) {
  return date.year.toString().startsWith('2');
}

export function isDateIslamic(date: NgbDateStruct) {
  return date.year.toString().startsWith('1');
}

export function dateToGregorianIsoString(
  date: string,
  format: 'short' | 'full' = 'full',
) {
  if (!date) return;

  // this is Gregorian date
  if (date.startsWith('2')) {
    if (format === 'short') {
      return date.split('T')[0];
    }
    return date;
  }

  const dateOnly = date.split('T')[0];
  const m = moment(date, 'iYYYY-iMM-iDD', true);

  if (!m.isValid()) {
    return;
  }

  const finalValue = m.locale('en-US').format('YYYY-MM-DD[T]HH:mm:ss.SSSZ');

  if (format === 'short') {
    return finalValue.split('T')[0];
  }
  return finalValue;
}

export function formatDate(dateObj: {
  year: number;
  month: number;
  day: number;
}): string {
  const {year, month, day} = dateObj;
  return format(new Date(year, month - 1, day), 'yyyy-MM-dd');
}

import moment from 'moment';
import 'moment/locale/ar';

export function convertDateToArabic(date: string): string {
  moment.locale('ar'); // Set moment to Arabic locale
  return moment(date).locale('ar').format('dddd DD MMMM YYYY');
}

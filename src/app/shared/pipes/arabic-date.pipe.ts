import {Pipe, PipeTransform} from '@angular/core';
import moment from 'moment';
import 'moment/locale/ar';

@Pipe({
    name: 'formatDateLang',
    standalone: false
})
export class FormatDateLangPipe implements PipeTransform {
  transform(date: Date | string, language: string, format: string = 'YYYY/MM/DD'): string {
    moment.locale(language);
    return moment(date).locale('ar').format(format);
  }
}

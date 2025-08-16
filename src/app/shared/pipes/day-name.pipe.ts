import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'dayName',
    pure: false,
    standalone: false
})
export class DayNamePipe implements PipeTransform {

  constructor(private translate: TranslateService) {}

  transform(
    date: string | Date,
  ): string {
    try {
      const dateObj = new Date(date)
      return dateObj.toLocaleDateString(this.translate.currentLang as 'ar-EG' | 'en-US', {weekday: 'long'})
    } catch (error) {
      console.error('Invalid date provided to dayName pipe:', error);
      return '';
    }
  }
}

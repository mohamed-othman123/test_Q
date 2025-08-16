import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
    name: 'formatDate',
    pure: false,
    standalone: false
})
export class FormatDatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}
  transform(value: string): string {
    if (!value) return '';

    const date = new Date(value);

    // Extract date parts
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    // Extract time parts
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period =
      hours >= 12
        ? this.translate.instant('common.PM')
        : this.translate.instant('common.AM');
    hours = hours % 12 || 12; // Convert to 12-hour format

    return `${day}-${month}-${year} ${hours}:${minutes} ${period}`;
  }
}

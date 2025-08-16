import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'formatUtcDate',
    pure: false,
    standalone: false
})
export class FormatUTCDatePipe implements PipeTransform {
    constructor(private translate: TranslateService) { }

    transform(value: string): string {
        if (!value) return '';

        // Parse date as UTC
        const date = new Date(value);

        // Extract date parts
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
        const year = date.getUTCFullYear();

        // Extract time parts
        let hours = date.getUTCHours();
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const period =
            hours >= 12
                ? this.translate.instant('common.PM') // مساءً
                : this.translate.instant('common.AM'); // صباحًا
        hours = hours % 12 || 12; // Convert to 12-hour format

        return `${day}-${month}-${year} ${hours}:${minutes} ${period}`;
    }
}

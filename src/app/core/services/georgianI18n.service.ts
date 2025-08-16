import {Injectable} from '@angular/core';
import {NgbDatepickerI18n, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class GeorgianI18nService extends NgbDatepickerI18n {
  constructor(private translateService: TranslateService) {
    super();
  }

  getMonthShortName(month: number): string {
    return this.translateService.instant(`MONTHS_SHORT.${month}`);
  }

  getMonthFullName(month: number): string {
    return this.translateService.instant(`MONTHS_FULL.${month}`);
  }

  getWeekdayLabel(weekday: number): string {
    return this.translateService.instant(`WEEKDAYS.${weekday}`);
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}-${date.month}-${date.year}`;
  }
}

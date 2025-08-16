import {NgModule} from '@angular/core';
import {CalendarRoutingModule} from './calendar-routing.module';
import {CalendarDateFormatter, CalendarModule, MOMENT} from 'angular-calendar';
import {HijriModule} from './utils/hijri.module';
import {SharedModule} from '@shared/shared.module';
import moment from 'moment';
import {HijriCalendarMomentDateFormatter} from './utils/utilites/HijriCalendarMomentDateFormatter';
import {registerLocaleData} from '@angular/common';
import localeArSA from '@angular/common/locales/ar-SA';
import {TooltipContentComponent} from './components/tooltip-content/tooltip-content.component';
import {DayTemplateComponent} from './components/day-template/day-template.component';
import {CalendarComponent} from '@calendar/pages/calendar.component';

@NgModule({
  declarations: [
    CalendarComponent,
    TooltipContentComponent,
    DayTemplateComponent,
  ],
  imports: [CalendarRoutingModule, CalendarModule, HijriModule, SharedModule],
  exports: [CalendarComponent],
  providers: [
    {
      provide: MOMENT,
      useValue: moment,
    },
    {
      provide: CalendarDateFormatter,
      useClass: HijriCalendarMomentDateFormatter,
    },
  ],
})
export class BookingCalendarModule {
  constructor() {
    registerLocaleData(localeArSA);
  }
}

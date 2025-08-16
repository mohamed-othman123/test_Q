/**
 * ### Overview
 *
 * The `HijriModule` is an Angular module that integrates a Hijri date adapter and date formatter into an Angular calendar. It configures the calendar to use the Hijri calendar system and provides necessary locale data.
 *
 * ### Key Features
 *
 * - **Date Adapter Integration:** Uses `HijriAdapter` for date operations.
 * - **Date Formatter Integration:** Uses `HijriCalendarMomentDateFormatter` for date formatting.
 * - **Locale Support:** Registers the `ar-SA` locale data for Arabic Saudi Arabia.
 * - **Component Integration:** Integrates the `CalendarComponent` to display the calendar.
 */

import {LOCALE_ID, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CalendarDateFormatter,
  CalendarModule,
  DateAdapter,
  MOMENT,
} from 'angular-calendar';
import moment from 'moment';
import {HijriAdapter} from './utilites/HijriAdapter';
import {ReactiveFormsModule} from '@angular/forms';
import {HijriCalendarMomentDateFormatter} from './utilites/HijriCalendarMomentDateFormatter';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: function () {
        return new HijriAdapter();
      },
    }),
    ReactiveFormsModule,
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'ar-SA'},
    {
      provide: MOMENT,
      useValue: moment,
    },
    {
      provide: CalendarDateFormatter,
      useClass: HijriCalendarMomentDateFormatter,
    },
    HijriAdapter,
  ],
})
export class HijriModule {}

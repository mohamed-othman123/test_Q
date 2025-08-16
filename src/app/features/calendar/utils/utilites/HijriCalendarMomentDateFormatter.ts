/**
 * ### Overview
 *
 * The `HijriCalendarMomentDateFormatter` class implements the `CalendarDateFormatterInterface` from `angular-calendar`. It provides various methods to format dates for different views (month, week, day) using the Hijri calendar when specified. This formatter uses the `HijriAdapter` to get the current locale and calendar type, allowing for dynamic switching between Gregorian and Hijri date formats.
 *
 * ### Key Features
 *
 * - **Month View Formatting:** Provides formatted strings for month view column headers, day numbers, and titles.
 * - **Week View Formatting:** Provides formatted strings for week view column headers, sub-headers, and titles.
 * - **Day View Formatting:** Provides formatted strings for day view hours and titles.
 * - **Dynamic Calendar Type:** Supports both Hijri and Gregorian calendar types, dynamically formatting dates based on the current calendar type set in `HijriAdapter`.
 *
 * ### Methods
 *
 * - **monthViewColumnHeader:** Formats the column header for the month view.
 * - **monthViewDayNumber:** Formats the day number for the month view.
 * - **monthViewTitle:** Formats the title for the month view.
 * - **weekViewColumnHeader:** Formats the column header for the week view.
 * - **weekViewColumnSubHeader:** Formats the sub-header for the week view.
 * - **weekViewTitle:** Formats the title for the week view.
 * - **weekViewHour:** Formats the hour for the week view.
 * - **dayViewHour:** Formats the hour for the day view.
 * - **dayViewTitle:** Formats the title for the day view.
 */

import {Injectable} from '@angular/core';
import {
  CalendarDateFormatterInterface,
  DateFormatterParams,
  getWeekViewPeriod,
} from 'angular-calendar';
import momentHijri from 'moment-hijri';
import {HijriAdapter} from './HijriAdapter';

@Injectable()
export class HijriCalendarMomentDateFormatter
  implements CalendarDateFormatterInterface
{
  constructor(protected dateAdapter: HijriAdapter) {}

  /**
   * Formats the header for a month view column.
   * @param date The date to format.
   * @param locale The locale to use.
   * @returns The formatted column header. like 'Sunday', 'Monday', etc.
   */
  public monthViewColumnHeader({date, locale}: DateFormatterParams): string {
    return momentHijri(date)
      .locale(this.dateAdapter.getLocale())
      .format('dddd');
  }

  /**
   * Formats the day number for a month view.
   * @param date The date to format.
   * @param locale The locale to use.
   * @returns The formatted day number. like '1', '2', etc.
   */
  public monthViewDayNumber({date, locale}: DateFormatterParams): string {
    if (this.dateAdapter.getCalendarType() === 'h') {
      return momentHijri(date)
        .locale(this.dateAdapter.getLocale())
        .format('iD');
    }
    return momentHijri(date).locale(this.dateAdapter.getLocale()).format('D');
  }

  /**
   * Formats the title for a month view.
   * @param date The date to format.
   * @param locale The locale to use.
   * @returns The formatted month view title. like 'January 2024', 'February 2024', etc.
   */
  public monthViewTitle({date, locale}: DateFormatterParams): string {
    if (this.dateAdapter.getCalendarType() === 'h') {
      return momentHijri(date)
        .locale(this.dateAdapter.getLocale())
        .format('iMMMM iYYYY');
    }
    return momentHijri(date)
      .locale(this.dateAdapter.getLocale())
      .format('MMMM YYYY');
  }

  /**
   * Formats the header for a week view column.
   * @param date The date to format.
   * @param locale The locale to use.
   * @returns The formatted week view column header. like 'Sunday', 'Monday', etc.
   */
  public weekViewColumnHeader({date, locale}: DateFormatterParams): string {
    return momentHijri(date)
      .locale(this.dateAdapter.getLocale())
      .format('dddd');
  }

  /**
   * Formats the sub-header for a week view column.
   * @param date The date to format.
   * @param locale The locale to use.
   * @returns The formatted week view column sub-header. like 'Jan 1', 'Feb 2', etc.
   */
  public weekViewColumnSubHeader({date, locale}: DateFormatterParams): string {
    if (this.dateAdapter.getCalendarType() === 'h') {
      return momentHijri(date)
        .locale(this.dateAdapter.getLocale())
        .format('iMMM iD');
    }
    return momentHijri(date)
      .locale(this.dateAdapter.getLocale())
      .format('MMM D');
  }

  /**
   * Formats the title for a week view.
   * @param date The date to format.
   * @param locale The locale to use.
   * @param weekStartsOn The day the week starts on.
   * @param excludeDays The days to exclude from the week.
   * @param daysInWeek The number of days in the week.
   * @returns The formatted week view title. like 'Jan 1 - Jan 7, 2024', 'Feb 2 - Feb 8, 2024', etc.
   */
  public weekViewTitle({
    date,
    locale,
    weekStartsOn,
    excludeDays,
    daysInWeek,
  }: DateFormatterParams): string {
    const {viewStart, viewEnd} = getWeekViewPeriod(
      this.dateAdapter,
      date,
      weekStartsOn!,
      excludeDays,
      daysInWeek,
    );
    let format = (dateToFormat: Date, showYear: boolean) =>
      momentHijri(dateToFormat)
        .locale(this.dateAdapter.getLocale())
        .format('MMM D' + (showYear ? ', YYYY' : ''));
    if (this.dateAdapter.getCalendarType() === 'h') {
      format = (dateToFormat: Date, showYear: boolean) =>
        momentHijri(dateToFormat)
          .locale(this.dateAdapter.getLocale())
          .format('iMMM iD' + (showYear ? ', iYYYY' : ''));
    }
    return `${format(
      viewStart,
      viewStart.getUTCFullYear() !== viewEnd.getUTCFullYear(),
    )} - ${format(viewEnd, true)}`;
  }

  /**
   * Formats the hour for a week view.
   * @param date The date to format.
   * @param locale The locale to use.
   * @returns The formatted week view hour. like '12am', '1pm', etc.
   */
  public weekViewHour({date, locale}: DateFormatterParams): string {
    return momentHijri(date).locale(this.dateAdapter.getLocale()).format('ha');
  }

  /**
   * Formats the hour for a day view.
   * @param date The date to format.
   * @param locale The locale to use.
   * @returns The formatted day view hour. like '12am', '1pm', etc.
   */
  public dayViewHour({date, locale}: DateFormatterParams): string {
    return momentHijri(date).locale(this.dateAdapter.getLocale()).format('ha');
  }

  /**
   * Formats the title for a day view.
   * @param date The date to format.
   * @param locale The locale to use.
   * @returns The formatted day view title. like 'Sunday, Jan 1, 2024', 'Monday, Feb 2, 2024', etc.
   */
  public dayViewTitle({date, locale}: DateFormatterParams): string {
    if (this.dateAdapter.getCalendarType() === 'h') {
      return momentHijri(date)
        .locale(this.dateAdapter.getLocale())
        .format('dddd,iD iMMM iYYYY');
    }
    return momentHijri(date)
      .locale(this.dateAdapter.getLocale())
      .format('dddd, LL');
  }
}

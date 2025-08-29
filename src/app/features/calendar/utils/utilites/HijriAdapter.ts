/*
* Title: HijriAdapter.ts
* The HijriAdapter class provides a set of methods to work with dates using the Hijri calendar system.
* It uses the moment-hijri library to perform date manipulations and calculations,
* supporting both the Hijri and Gregorian calendars.
* The class allows setting the locale and calendar type and provides methods to add/subtract time units,
* calculate differences, and get/set various date pages.

* Key Features
*   Locale and Calendar Type Management: Easily switch between locales and calendar types.
*   Date Manipulation: Add or subtract days, hours, minutes, seconds, weeks, and months.
*   Date Comparison: Check if two dates are the same day, month, or second.
*   Date Retrieval and Setting: Get or set date pages such as day, month, and year.
*   Timezone Offset Calculation: Retrieve the timezone offset for a given date.
* */

import moment from 'moment-hijri'; // Import the Hijri calendar extension for moment.js
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HijriAdapter {
  static localCode: string = 'en'; // Default locale code
  static calendarTypeCode: string = 'h'; // Default calendar type code (Hijri)

  /**
   * Sets the locale for the adapter.
   * @param localCode The locale code to set.
   */
  setLocale(localCode: string): void {
    HijriAdapter.localCode = localCode;
  }

  /**
   * Gets the current locale of the adapter.
   * @returns The current locale code.
   */
  getLocale(): string {
    return HijriAdapter.localCode;
  }

  /**
   * Sets the calendar type for the adapter.
   * @param calendarTypeCode The calendar type code to set ('h' for Hijri, otherwise Gregorian).
   */
  setCalendarType(calendarTypeCode: string): void {
    HijriAdapter.calendarTypeCode = calendarTypeCode;
  }

  /**
   * Gets the current calendar type of the adapter.
   * @returns The current calendar type code.
   */
  getCalendarType(): string {
    return HijriAdapter.calendarTypeCode;
  }

  /**
   * Gets the timezone offset of a date.
   * @param date The date to get the timezone offset for.
   * @returns The timezone offset in minutes.
   */
  getTimezoneOffset(date: number | Date): number {
    return moment(date).locale(HijriAdapter.localCode).utcOffset();
  }

  /**
   * Adds a specified number of days to a date.
   * @param date The date to add days to.
   * @param amount The number of days to add.
   * @returns The new date with the added days.
   */
  addDays(date: Date | string | number, amount: number): Date {
    return moment(date)
      .locale(HijriAdapter.localCode)
      .add(amount, 'days')
      .toDate();
  }

  /**
   * Adds a specified number of hours to a date.
   * @param date The date to add hours to.
   * @param amount The number of hours to add.
   * @returns The new date with the added hours.
   */
  addHours(date: Date | string | number, amount: number): Date {
    return moment(date)
      .locale(HijriAdapter.localCode)
      .add(amount, 'hours')
      .toDate();
  }

  /**
   * Adds a specified number of minutes to a date.
   * @param date The date to add minutes to.
   * @param amount The number of minutes to add.
   * @returns The new date with the added minutes.
   */
  addMinutes(date: Date | string | number, amount: number): Date {
    return moment(date)
      .locale(HijriAdapter.localCode)
      .add(amount, 'minutes')
      .toDate();
  }

  /**
   * Adds a specified number of seconds to a date.
   * @param date The date to add seconds to.
   * @param amount The number of seconds to add.
   * @returns The new date with the added seconds.
   */
  addSeconds(date: Date | string | number, amount: number): Date {
    return moment(date)
      .locale(HijriAdapter.localCode)
      .add(amount, 'seconds')
      .toDate();
  }

  /**
   * Calculates the difference in days between two dates.
   * @param dateLeft The first date.
   * @param dateRight The second date.
   * @returns The difference in days.
   */
  differenceInDays(
    dateLeft: Date | string | number,
    dateRight: Date | string | number,
  ): number {
    return moment(dateLeft)
      .locale(HijriAdapter.localCode)
      .diff(moment(dateRight), 'days');
  }

  /**
   * Calculates the difference in minutes between two dates.
   * @param dateLeft The first date.
   * @param dateRight The second date.
   * @returns The difference in minutes.
   */
  differenceInMinutes(
    dateLeft: Date | string | number,
    dateRight: Date | string | number,
  ): number {
    return moment(dateLeft)
      .locale(HijriAdapter.localCode)
      .diff(moment(dateRight), 'minutes');
  }

  /**
   * Calculates the difference in seconds between two dates.
   * @param dateLeft The first date.
   * @param dateRight The second date.
   * @returns The difference in seconds.
   */
  differenceInSeconds(
    dateLeft: Date | string | number,
    dateRight: Date | string | number,
  ): number {
    return moment(dateLeft)
      .locale(HijriAdapter.localCode)
      .diff(moment(dateRight), 'seconds');
  }

  /**
   * Gets the end of the day for a date.
   * @param date The date to get the end of the day for.
   * @returns The new date representing the end of the day.
   */
  endOfDay(date: Date | string | number): Date {
    return moment(date).locale(HijriAdapter.localCode).endOf('day').toDate();
  }

  /**
   * Gets the end of the month for a date.
   * @param date The date to get the end of the month for.
   * @returns The new date representing the end of the month.
   */
  endOfMonth(date: Date | string | number): Date {
    if (HijriAdapter.calendarTypeCode === 'h') {
      return moment(date)
        .locale(HijriAdapter.localCode)
        .endOf('iMonth')
        .toDate();
    }
    return moment(date).locale(HijriAdapter.localCode).endOf('month').toDate();
  }

  /**
   * Gets the end of the week for a date.
   * @param date The date to get the end of the week for.
   * @returns The new date representing the end of the week.
   */
  endOfWeek(date: Date | string | number): Date {
    return moment(date).locale(HijriAdapter.localCode).endOf('week').toDate();
  }

  /**
   * Gets the day of the week for a date.
   * @param date The date to get the day of the week for.
   * @returns The day of the week.
   */
  getDay(date: Date | string | number): number {
    return moment(date).locale(HijriAdapter.localCode).day();
  }

  /**
   * Gets the month for a date.
   * @param date The date to get the month for.
   * @returns The month.
   */
  getMonth(date: Date | string | number): number {
    if (HijriAdapter.calendarTypeCode === 'h') {
      return moment(date).locale(HijriAdapter.localCode).iMonth();
    }
    return moment(date).locale(HijriAdapter.localCode).month();
  }

  /**
   * Checks if two dates fall on the same day.
   * @param dateLeft The first date.
   * @param dateRight The second date.
   * @returns True if the dates fall on the same day, false otherwise.
   */
  isSameDay(
    dateLeft: Date | string | number,
    dateRight: Date | string | number,
  ): boolean {
    return moment(dateLeft)
      .locale(HijriAdapter.localCode)
      .isSame(moment(dateRight), 'day');
  }

  /**
   * Checks if two dates fall in the same month.
   * @param dateLeft The first date.
   * @param dateRight The second date.
   * @returns True if the dates fall in the same month, false otherwise.
   */
  isSameMonth(
    dateLeft: Date | string | number,
    dateRight: Date | string | number,
  ): boolean {
    if (HijriAdapter.calendarTypeCode === 'h') {
      return (
        moment(dateLeft).locale(HijriAdapter.localCode).iMonth() ===
        moment(dateRight).iMonth()
      );
    }
    return (
      moment(dateLeft).locale(HijriAdapter.localCode).month() ===
      moment(dateRight).month()
    );
  }

  /**
   * Checks if two dates fall in the same second.
   * @param dateLeft The first date.
   * @param dateRight The second date.
   * @returns True if the dates fall in the same second, false otherwise.
   */
  isSameSecond(
    dateLeft: Date | string | number,
    dateRight: Date | string | number,
  ): boolean {
    return moment(dateLeft)
      .locale(HijriAdapter.localCode)
      .isSame(moment(dateRight), 'second');
  }

  /**
   * Gets the maximum date from a list of dates.
   * @param dates The list of dates.
   * @returns The maximum date.
   */
  max(dates: (Date | number)[]): Date {
    return moment
      .max(dates.map((date) => moment(date).locale(HijriAdapter.localCode)))
      .toDate();
  }

  /**
   * Sets the hours for a date.
   * @param date The date to set the hours for.
   * @param hours The hours to set.
   * @returns The new date with the set hours.
   */
  setHours(date: Date | string | number, hours: number): Date {
    return moment(date).locale(HijriAdapter.localCode).hours(hours).toDate();
  }

  /**
   * Sets the minutes for a date.
   * @param date The date to set the minutes for.
   * @param minutes The minutes to set.
   * @returns The new date with the set minutes.
   */
  setMinutes(date: Date | string | number, minutes: number): Date {
    return moment(date)
      .locale(HijriAdapter.localCode)
      .minutes(minutes)
      .toDate();
  }

  /**
   * Gets the start of the day for a date.
   * @param date The date to get the start of the day for.
   * @returns The new date representing the start of the day.
   */
  startOfDay(date: Date | string | number): Date {
    return moment(date).locale(HijriAdapter.localCode).startOf('day').toDate();
  }

  /**
   * Gets the start of the minute for a date.
   * @param date The date to get the start of the minute for.
   * @returns The new date representing the start of the minute.
   */
  startOfMinute(date: Date | string | number): Date {
    return moment(date)
      .locale(HijriAdapter.localCode)
      .startOf('minute')
      .toDate();
  }

  /**
   * Gets the start of the month for a date.
   * @param date The date to get the start of the month for.
   * @returns The new date representing the start of the month.
   */
  startOfMonth(date: Date | string | number): Date {
    if (HijriAdapter.calendarTypeCode === 'h') {
      return moment(date)
        .locale(HijriAdapter.localCode)
        .startOf('iMonth')
        .toDate();
    }
    return moment(date)
      .locale(HijriAdapter.localCode)
      .startOf('month')
      .toDate();
  }

  /**
   * Gets the start of the week for a date.
   * @param date The date to get the start of the week for.
   * @returns The new date representing the start of the week.
   */
  startOfWeek(date: Date | string | number): Date {
    return moment(date).locale(HijriAdapter.localCode).startOf('week').toDate();
  }

  /**
   * Gets the hours for a date.
   * @param date The date to get the hours for.
   * @returns The hours.
   */
  getHours(date: Date | string | number): number {
    return moment(date).locale(HijriAdapter.localCode).hours();
  }

  /**
   * Gets the minutes for a date.
   * @param date The date to get the minutes for.
   * @returns The minutes.
   */
  getMinutes(date: Date | string | number): number {
    return moment(date).locale(HijriAdapter.localCode).minutes();
  }

  /**
   * Adds a specified number of weeks to a date.
   * @param date The date to add weeks to.
   * @param amount The number of weeks to add.
   * @returns The new date with the added weeks.
   */
  addWeeks(date: Date | string | number, amount: number): Date {
    return moment(date)
      .locale(HijriAdapter.localCode)
      .add(amount, 'week')
      .toDate();
  }

  /**
   * Adds a specified number of months to a date.
   * @param date The date to add months to.
   * @param amount The number of months to add.
   * @returns The new date with the added months.
   */
  addMonths(date: Date | string | number, amount: number): Date {
    if (HijriAdapter.calendarTypeCode === 'h') {
      return moment(date)
        .locale(HijriAdapter.localCode)
        .add(amount, 'iMonth')
        .toDate();
    }
    return moment(date)
      .locale(HijriAdapter.localCode)
      .add(amount, 'month')
      .toDate();
  }

  /**
   * Subtracts a specified number of days from a date.
   * @param date The date to subtract days from.
   * @param amount The number of days to subtract.
   * @returns The new date with the subtracted days.
   */
  subDays(date: Date | string | number, amount: number): Date {
    return moment(date)
      .locale(HijriAdapter.localCode)
      .subtract(amount, 'days')
      .toDate();
  }

  /**
   * Subtracts a specified number of weeks from a date.
   * @param date The date to subtract weeks from.
   * @param amount The number of weeks to subtract.
   * @returns The new date with the subtracted weeks.
   */
  subWeeks(date: Date | string | number, amount: number): Date {
    return moment(date)
      .locale(HijriAdapter.localCode)
      .subtract(amount, 'week')
      .toDate();
  }

  /**
   * Subtracts a specified number of months from a date.
   * @param date The date to subtract months from.
   * @param amount The number of months to subtract.
   * @returns The new date with the subtracted months.
   */
  subMonths(date: Date | string | number, amount: number): Date {
    if (HijriAdapter.calendarTypeCode === 'h') {
      return moment(date)
        .locale(HijriAdapter.localCode)
        .subtract(amount, 'iMonth')
        .toDate();
    }
    return moment(date)
      .locale(HijriAdapter.localCode)
      .subtract(amount, 'month')
      .toDate();
  }

  /**
   * Gets the ISO week number for a date.
   * @param date The date to get the ISO week number for.
   * @returns The ISO week number.
   */
  getISOWeek(date: Date | string | number): number {
    return moment(date).locale(HijriAdapter.localCode).isoWeek();
  }

  /**
   * Sets the day of the month for a date.
   * @param date The date to set the day of the month for.
   * @param dayOfMonth The day of the month to set.
   * @returns The new date with the set day of the month.
   */
  setDate(date: Date | string | number, dayOfMonth: number): Date {
    if (HijriAdapter.calendarTypeCode === 'h') {
      return moment(date)
        .locale(HijriAdapter.localCode)
        .iDate(dayOfMonth)
        .toDate();
    }
    return moment(date)
      .locale(HijriAdapter.localCode)
      .date(dayOfMonth)
      .toDate();
  }

  /**
   * Sets the month for a date.
   * @param date The date to set the month for.
   * @param month The month to set.
   * @returns The new date with the set month.
   */
  setMonth(date: Date | string | number, month: number): Date {
    if (HijriAdapter.calendarTypeCode === 'h') {
      return moment(date).locale(HijriAdapter.localCode).iMonth(month).toDate();
    }
    return moment(date).locale(HijriAdapter.localCode).month(month).toDate();
  }

  /**
   * Sets the year for a date.
   * @param date The date to set the year for.
   * @param year The year to set.
   * @returns The new date with the set year.
   */
  setYear(date: Date | string | number, year: number): Date {
    if (HijriAdapter.calendarTypeCode === 'h') {
      return moment(date).locale(HijriAdapter.localCode).iYear(year).toDate();
    }
    return moment(date).locale(HijriAdapter.localCode).year(year).toDate();
  }

  /**
   * Gets the day of the month for a date.
   * @param date The date to get the day of the month for.
   * @returns The day of the month.
   */
  getDate(date: Date | string | number): number {
    if (HijriAdapter.calendarTypeCode === 'h') {
      return moment(date).locale(HijriAdapter.localCode).iDate();
    }
    return moment(date).locale(HijriAdapter.localCode).date();
  }

  /**
   * Gets the year for a date.
   * @param date The date to get the year for.
   * @returns The year.
   */
  getYear(date: Date | string | number): number {
    if (HijriAdapter.calendarTypeCode === 'h') {
      return moment(date).locale(HijriAdapter.localCode).iYear();
    }
    return moment(date).locale(HijriAdapter.localCode).year();
  }
}

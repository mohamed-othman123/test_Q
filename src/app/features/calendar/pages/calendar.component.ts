import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {CalendarEvent} from 'angular-calendar';
import {FormControl, FormGroup} from '@angular/forms';
import {forkJoin, Subject, takeUntil, tap} from 'rxjs';
import moment from 'moment-hijri';
import {HijriAdapter} from '@calendar/utils/utilites/HijriAdapter';
import {Router} from '@angular/router';
import 'moment/locale/ar-sa';
import {CalendarBookingsService} from '@calendar/services/calendar-bookings.service';
import {CalendarBooking} from '@calendar/models/calendar';
import {HallsService} from '@halls/services/halls.service';
import {TranslateService} from '@ngx-translate/core';
import {LanguageService} from '@core/services';

interface DateParams {
  year: number;
  month: number;
}

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
    standalone: false
})
export class CalendarComponent implements OnInit, OnDestroy {
  @ViewChild('next') nextBtn!: ElementRef;
  @ViewChild('prev') prevBtn!: ElementRef;
  @ViewChild('cellTemplate', {static: true}) cellTemplate!: TemplateRef<any>;

  form!: FormGroup;
  events: CalendarEvent[] = [];
  refresh: Subject<void> = new Subject<void>();
  activeDayIsOpen: boolean = false;
  excludeDays: number[] = [];
  weekStartsOn: number = 7;
  showTooltip: boolean = false;
  currentLanguage!: string;

  private destroy$ = new Subject<void>();

  constructor(
    private dateAdapter: HijriAdapter,
    private router: Router,
    private calendarBookingsService: CalendarBookingsService,
    private hallsService: HallsService,
    private translate: TranslateService,
    public languageService: LanguageService,
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.getPosts();

    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const currentLang = this.languageService.getCurrentLanguage();
      this.currentLanguage = currentLang;
      this.dateAdapter.setLocale(currentLang === 'ar' ? 'ar-SA' : 'en');
      this.refresh.next();
    });

    const currentLang = this.languageService.getCurrentLanguage();
    this.currentLanguage = currentLang;
    this.dateAdapter.setLocale(currentLang === 'ar' ? 'ar-SA' : 'en');

    // this.hallsService.currentHall$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(() => {
    //     this.getPosts();
    //   });
  }

  get viewDate(): Date {
    return this.form.controls['date'].value;
  }

  set viewDate(val: Date) {
    if (!this.isSameHijriMonth(val, this.form.controls['date'].value)) {
      this.activeDayIsOpen = false;
      this.showTooltip = false;
    }
    this.form.controls['date'].setValue(val);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.calendar-day') && !target.closest('.tooltip-body')) {
      this.showTooltip = false;
    }
  }

  private formatEventTitle(booking: CalendarBooking): string {
    const truncatedName =
      booking.user.name.length > 20
        ? `${booking.user.name.slice(0, 20)}...`
        : booking.user.name;

    return `<div class="event-name">${truncatedName}</div><div class="event-type">${this.languageService.lang === 'ar' ? booking.eventType.name_ar : booking.eventType.name}</div>`;
  }

  getPosts() {
    const current = moment(this.viewDate);
    const next = current.clone().add(1, 'month');

    const params$ = forkJoin({
      currentBookings: this.calendarBookingsService.getCalendarBookings(
        this.toParams(current),
      ),
      nextBookings: this.calendarBookingsService.getCalendarBookings(
        this.toParams(next),
      ),
    });

    params$
      .pipe(
        takeUntil(this.destroy$),
        tap(({currentBookings, nextBookings}) => {
          this.events = [
            ...this.mapToEvents(currentBookings, current),
            ...this.mapToEvents(nextBookings, next),
          ];
          this.refresh.next();
        }),
      )
      .subscribe();
  }

  private toParams(date: moment.Moment): DateParams {
    return {
      year: date.year(),
      month: date.month() + 1,
    };
  }

  private mapToEvents(bookings: any[], date: moment.Moment) {
    return Object.entries(bookings).flatMap(([day, entries]) => {
      return entries.map((ele: CalendarBooking) => {
        const d = date.clone().date(Number(day)).toDate();
        const allDay = ele.eventTime === 'Full Day';

        return {
          id: ele.id,
          start: d,
          end: d,
          title: this.formatEventTitle(ele),
          allDay: allDay,
          meta: ele,
        };
      });
    });
  }

  nextMonth() {
    this.viewDate = moment(this.viewDate).add(1, 'month').toDate();
    // this.events = [];
    this.getPosts();
  }

  prevMonth() {
    this.viewDate = moment(this.viewDate).subtract(1, 'month').toDate();
    // this.events = [];
    this.getPosts();
  }

  addEventForDay(day: Date, event: MouseEvent): void {
    event.stopPropagation();

    this.router.navigate(['/orders/add-new-order'], {
      queryParams: {
        date: moment(day).locale('en').format('YYYY-MM-DD'),
      },
    });
  }

  getHijriDayForCalCells(gregorianDate: Date): string {
    const hijriDay = moment(gregorianDate).locale('en').format('iD');
    return hijriDay.padStart(2, '0');
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 5 || day === 6;
  }

  isSameHijriMonth(date1: Date, date2: Date): boolean {
    return this.dateAdapter.isSameMonth(date1, date2);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  private initForm() {
    this.form = new FormGroup({
      date: new FormControl(moment().toDate()),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

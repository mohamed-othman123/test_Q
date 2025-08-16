import {Injectable} from '@angular/core';
import {HallsService} from '@halls/services/halls.service';
import {TranslateService} from '@ngx-translate/core';
import {OrdersService} from '@orders/services/orders.service';
import {PaymentService} from '@payment/services/payment.service';
import {
  BehaviorSubject,
  filter,
  combineLatest,
  switchMap,
  distinctUntilChanged,
  shareReplay,
  debounceTime,
} from 'rxjs';
import {DashboardService} from './dashboard.service';
import {FormControl} from '@angular/forms';
import {customizeDate} from '@dashboard/models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardFacadeService {
  months$ = new BehaviorSubject<string>('1'); // for the current selected month
  customizeDate$ = new BehaviorSubject<customizeDate>({
    fromDate: '',
    toDate: '',
  });

  currentSelectedFilterType$ = new BehaviorSubject<string>('1');

  constructor(
    private hallService: HallsService,
    private dashboardService: DashboardService,
    private ordersService: OrdersService,
  ) {}

  transactionFilterByOptions = [
    {label: {en: 'Weekly', ar: 'أسبوعيا'}, value: 'Week'},
    {label: {en: 'Monthly', ar: 'شهريا'}, value: 'Month'},
  ];

  transactionFilterType$ = new BehaviorSubject<'All' | 'Income' | 'Expense'>(
    'All',
  );

  chartFilter$ = new BehaviorSubject<'week' | 'month'>('week');

  reservationYear$ = new BehaviorSubject<number>(new Date().getFullYear());
  reservationMonth$ = new BehaviorSubject<number>(new Date().getMonth() + 1);

  private hall$ = this.hallService.currentHall$.pipe(filter(Boolean));
  transactionFilterBy = new FormControl(this.transactionFilterByOptions[0]);

  keyMetrics$ = combineLatest({
    hall: this.hall$,
    months: this.months$.pipe(distinctUntilChanged()),
    customizeDate: this.customizeDate$,
  }).pipe(
    debounceTime(300),

    switchMap(({hall, months, customizeDate}) => {
      return this.dashboardService.getDashboardKeyMetrics(
        String(hall.id),
        months,
        customizeDate.fromDate,
        customizeDate.toDate,
      );
    }),
  );

  upcomingBooking$ = combineLatest({
    bookingStatus: this.ordersService.getBookingStatus(),
    hall: this.hall$,
  }).pipe(
    switchMap(({bookingStatus, hall}) =>
      this.dashboardService.getUpcomingBooking(hall.id),
    ),
  );

  reservedBookings$ = combineLatest({
    hall: this.hall$,
    reservationDate: combineLatest({
      year: this.reservationYear$,
      month: this.reservationMonth$,
    }),
  }).pipe(
    distinctUntilChanged(
      (prev, curr) =>
        prev.hall.id === curr.hall.id &&
        prev.reservationDate.year === curr.reservationDate.year &&
        prev.reservationDate.month === curr.reservationDate.month,
    ),
    switchMap(({hall, reservationDate}) =>
      this.dashboardService.getReservedBookings(
        hall.id,
        reservationDate.year,
        reservationDate.month,
      ),
    ),
  );

  payments$ = combineLatest({
    hall: this.hallService.currentHall$,
    months: this.months$.pipe(distinctUntilChanged()),
    customizeDate: this.customizeDate$,
    filter: this.transactionFilterType$,
  }).pipe(
    debounceTime(300),

    shareReplay(1),
  );

  chartData$ = combineLatest({
    chartFilter: this.chartFilter$,
    hall: this.hall$,
    months: this.months$.pipe(distinctUntilChanged()),
    customizeDate: this.customizeDate$,
  }).pipe(
    debounceTime(300),

    switchMap(({chartFilter, hall, months, customizeDate}) => {
      return this.dashboardService.getDashboardChartData(
        String(hall.id),
        months,
        customizeDate.fromDate,
        customizeDate.toDate,
        chartFilter,
      );
    }),
  );

  navigateToReservation(event: any) {
    this.reservationYear$.next(event.next.year);
    this.reservationMonth$.next(event.next.month);
  }

  resetMonthsValue() {
    this.months$.next('');
  }
  resetCustomizeDateValue() {
    this.customizeDate$.next({
      fromDate: '',
      toDate: '',
    });
  }
}

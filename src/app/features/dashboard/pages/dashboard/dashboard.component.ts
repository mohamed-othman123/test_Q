import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
  DashboardResolvedData,
  KeyMetrics,
  ReservedBookings,
  UpcomingBooking,
} from '@dashboard/models/dashboard.model';
import {distinctUntilChanged, skip, Subscription} from 'rxjs';
import {DashboardFacadeService} from '@dashboard/services/dashboard-facade.service';
import {TranslateService} from '@ngx-translate/core';
import {formatDate} from '@shared/components/date-picker/helper/date-helper';
import {LanguageService} from '@core/services';
import {FormBuilder, Validators} from '@angular/forms';
import {dateRangeValidator} from '@core/validators/date-range';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  keyMetrics: KeyMetrics;
  upcomingBooking: UpcomingBooking[];
  reservedBookings: ReservedBookings[];
  resolvedData: DashboardResolvedData;

  showCustomDates = false;
  customDatesForm = this.fb.group(
    {
      fromDate: [null as any, Validators.required],
      toDate: [null as any, Validators.required],
    },
    {validators: [dateRangeValidator('fromDate', 'toDate')]},
  );

  currentSelectedFilterType$ = this.dashboardFacade.currentSelectedFilterType$;

  constructor(
    private dashboardFacade: DashboardFacadeService,
    private route: ActivatedRoute,
    public translateService: TranslateService,
    public lang: LanguageService,
    private fb: FormBuilder,
  ) {
    this.resolvedData = this.route.snapshot.data['resolvedData'];

    this.keyMetrics = this.resolvedData.keyMetrics;
    this.upcomingBooking = this.resolvedData.upcomingBooking;
    this.reservedBookings = this.resolvedData.reservedBookings;
  }

  ngOnInit(): void {
    const keyMetricsSub = this.dashboardFacade.keyMetrics$
      .pipe(distinctUntilChanged())
      .subscribe((keyMetrics) => {
        this.keyMetrics = keyMetrics;
      });
    const upcomingBookingSub = this.dashboardFacade.upcomingBooking$
      .pipe(skip(1))
      .subscribe((upcomingBooking) => {
        this.upcomingBooking = upcomingBooking;
      });
    const reservedBookingsSub =
      this.dashboardFacade.reservedBookings$.subscribe((reservedBookings) => {
        this.reservedBookings = reservedBookings;
      });

    this.subscriptions.push(
      keyMetricsSub,
      upcomingBookingSub,
      reservedBookingsSub,
    );
  }

  onDurationSelect(duration: number) {
    if (this.dashboardFacade.months$.value === String(duration)) {
      this.currentSelectedFilterType$.next(String(duration));
      return;
    }
    this.dashboardFacade.resetCustomizeDateValue();
    this.currentSelectedFilterType$.next(String(duration));
    this.dashboardFacade.months$.next(String(duration));
    this.showCustomDates = false;
  }

  toggleCustomDates() {
    this.currentSelectedFilterType$.next('custom');

    this.showCustomDates = !this.showCustomDates;
  }
  applyCustomDates() {
    if (this.customDatesForm.invalid) {
      this.customDatesForm.markAllAsTouched();
      return;
    }
    const {fromDate, toDate} = this.customDatesForm.value;

    const from = formatDate(fromDate);
    const to = formatDate(toDate);

    this.dashboardFacade.resetMonthsValue();
    this.dashboardFacade.customizeDate$.next({fromDate: from, toDate: to});
  }

  cancelCustomDates() {
    this.showCustomDates = false;
    this.customDatesForm.reset();
    this.onDurationSelect(1);
  }

  onNavigate(event: any) {
    this.dashboardFacade.navigateToReservation(event);
  }

  ngOnDestroy(): void {
    this.dashboardFacade.resetCustomizeDateValue();
    this.currentSelectedFilterType$.next('1');
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}

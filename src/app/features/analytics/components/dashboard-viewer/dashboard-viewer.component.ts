import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  signal,
  computed,
  effect,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  Subject,
  takeUntil,
  switchMap,
  of,
  Observable,
  tap,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import {
  AIAnalyticsService
} from '../../a-i-analytics.service';
import { HallsService } from '@halls/services/halls.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dateRangeValidator } from '@core/validators/date-range';
import { OrdersService } from '@orders/services/orders.service';
import { BookingFacadeService } from '@orders/services/booking-facade.service';
import { Item } from '@core/models';
import { ExpensesType } from '@purchases/constants/purchase.constants';
import { formatDate } from '@shared/components/date-picker/helper/date-helper';
import { TranslateService } from '@ngx-translate/core';
import { Dashboard, DashboardTypes, DashboardFilters } from '../../models/analytics.model';
import { PurchasesService } from '@purchases/services/purchases.service';
import { ExpensesItemsService } from '@expenses-items/services/expenses-items.service';

@Component({
  selector: 'app-dashboard-viewer',
  templateUrl: './dashboard-viewer.component.html',
  styleUrls: ['./dashboard-viewer.component.scss'],
  standalone: false,
})
export class DashboardViewerComponent implements OnInit, OnDestroy {
  @ViewChild('dashboardIframe', { static: false })
  iframeElement!: ElementRef<HTMLIFrameElement>;

  dashboardSignal = signal<Dashboard | null>(null);
  dashboardUrlSignal = signal<SafeResourceUrl | null>(null);
  loadingSignal = signal<boolean>(true);
  errorSignal = signal<string | null>(null);
  iframeLoadingSignal = signal<boolean>(true);
  filtersOpenSignal = signal<boolean>(false);
  fullscreenSignal = signal<boolean>(false);

  dashboardIdSignal = signal<number | null>(null);
  dashboardTypeSignal = signal<DashboardTypes>(DashboardTypes.Booking);

  selectedFilterTypeSignal = signal<string>('12');
  showCustomDatesSignal = signal<boolean>(false);

  eventTypesSignal = signal<any[]>([]);
  eventTimesSignal = signal<Item[]>([]);
  bookingStatusesSignal = signal<Item[]>([]);
  attendeesTypesSignal = signal<Item[]>([]);
  clientTypesSignal = signal<Item[]>([]);
  expenseStatusesSignal = signal<Item[]>([]);
  expenseTypesSignal = signal<Item[]>([]);
  expenseCategoriesSignal = signal<any[]>([]);
  expenseItemsSignal = signal<any[]>([]);

  timeGranularityOptions = [
    { value: 'daily', label: { en: 'Daily', ar: 'يومي' } },
    { value: 'monthly', label: { en: 'Monthly', ar: 'شهري' } },
    { value: 'quarterly', label: { en: 'Quarterly', ar: 'ربعي' } },
    { value: 'yearly', label: { en: 'Yearly', ar: 'سنوي' } }
  ];

  isDashboardLoadedSignal = computed(() =>
    !this.loadingSignal() && !this.errorSignal() && this.dashboardUrlSignal()
  );

  dashboardInfoSignal = computed(() => {
    const dashboard = this.dashboardSignal();
    const type = this.dashboardTypeSignal();

    return {
      dashboard,
      type,
      typeLabel: type === DashboardTypes.Booking ? 'bookings' : 'expenses',
      icon: type === DashboardTypes.Booking ? 'pi-calendar' : 'pi-money-bill'
    };
  });

  customDatesForm!: FormGroup;
  filtersForm!: FormGroup;

  dashboardTypes = DashboardTypes;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analyticsService: AIAnalyticsService,
    private hallsService: HallsService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private bookingFacadeService: BookingFacadeService,
    private purchasesService: PurchasesService,
    private expensesItemsService: ExpensesItemsService,
    public lang: TranslateService,
  ) {
    this.initializeForms();
    this.setupEffects();
  }

  ngOnInit(): void {
    this.loadFilterOptions();
    this.setupRouteSubscription();
    this.setupFormSubscriptions();
    this.setupFullscreenListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.customDatesForm = this.fb.group(
      {
        fromDate: [null, Validators.required],
        toDate: [null, Validators.required],
      },
      { validators: [dateRangeValidator('fromDate', 'toDate')] }
    );

    this.filtersForm = this.fb.group({
      months: [12],
      fromDate: [null],
      toDate: [null],
      timeGranularity: ['daily'],

      eventTypeId: [null],
      eventTime: [null],
      bookingProcessStatus: [null],
      attendeesType: [null],
      clientType: [null],

      expenseStatus: [null],
      expenseType: [null],
      expenseCategory: [null],
      expenseItem: [null],
    });
  }

  private setupEffects(): void {
    effect(() => {
      this.resetFiltersForDashboardType();
    });
  }

  private setupRouteSubscription(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            const dashboardId = +id;
            this.dashboardIdSignal.set(dashboardId);
            return this.loadDashboard(dashboardId);
          }
          return of(null);
        })
      )
      .subscribe();
  }

  private setupFormSubscriptions(): void {
    this.filtersForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged((prev, curr) => {
          return JSON.stringify(prev) === JSON.stringify(curr);
        })
      )
      .subscribe(() => {
        const dashboardId = this.dashboardIdSignal();
        if (dashboardId && !this.loadingSignal()) {
          this.loadDashboard(dashboardId).subscribe();
        }
      });

    this.filtersForm.get('expenseType')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        tap((expenseType) => {
          this.filtersForm.patchValue({
            expenseCategory: null,
            expenseItem: null,
          }, { emitEvent: false });
          this.expenseCategoriesSignal.set([]);
          this.expenseItemsSignal.set([]);
          
          if (expenseType === 'General') {
            this.filtersForm.patchValue({
              expenseItem: null,
            }, { emitEvent: false });
          }
        }),
        switchMap((expenseType) => {
          if (!expenseType) {
            return of({ items: [] });
          }
          const hallId = this.hallsService.getCurrentHall()?.id;
          return this.purchasesService.getPurchaseCategoriesList({
            type: expenseType,
            hallId,
          });
        })
      )
      .subscribe((response) => {
        this.expenseCategoriesSignal.set(response.items || []);
      });

    this.filtersForm.get('expenseCategory')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        tap((categoryId) => {
          this.filtersForm.patchValue({
            expenseItem: null,
          }, { emitEvent: false });
          this.expenseItemsSignal.set([]);
        }),
        switchMap((categoryId) => {
          if (!categoryId) {
            return of({ items: [] });
          }
          const hallId = this.hallsService.getCurrentHall()?.id;
          return this.expensesItemsService.getExpenseItems({
            categoryId,
            hallId,
          });
        })
      )
      .subscribe((response) => {
        this.expenseItemsSignal.set(response.items || []);
      });
  }

  private setupFullscreenListener(): void {
    document.addEventListener('fullscreenchange', () => {
      this.fullscreenSignal.set(!!document.fullscreenElement);
    });
  }

  private loadFilterOptions(): void {
    this.bookingFacadeService.getEvents().subscribe((events) => {
      this.eventTypesSignal.set(events.items);
    });

    this.ordersService.getEventTimes().subscribe((eventTimes) => {
      this.eventTimesSignal.set(eventTimes);
    });

    this.ordersService.getBookingStatus().subscribe((bookingStatuses) => {
      this.bookingStatusesSignal.set(bookingStatuses);
    });

    this.ordersService.getAttendeesTypes().subscribe((attendeesTypes) => {
      this.attendeesTypesSignal.set(attendeesTypes);
    });

    this.clientTypesSignal.set([
      { value: 'Individual', label: { en: 'Individual', ar: 'فرد' } },
      { value: 'Facility', label: { en: 'Facility', ar: 'منشأة' } },
      {
        value: 'Governmental Facility',
        label: { en: 'Governmental Facility', ar: 'منشأة حكومية' },
      },
    ]);

    this.expenseTypesSignal.set(ExpensesType);
    this.expenseStatusesSignal.set([
      { value: 'New', label: { en: 'New', ar: 'جديد' } },
      { value: 'Fully Paid', label: { en: 'Fully Paid', ar: 'مدفوع بالكامل' } },
      {
        value: 'Partially Paid',
        label: { en: 'Partially Paid', ar: 'مدفوع جزئياً' },
      },
      { value: 'Completed', label: { en: 'Completed', ar: 'مكتمل' } },
      { value: 'Canceled', label: { en: 'Canceled', ar: 'ملغي' } },
      { value: 'Late', label: { en: 'Late', ar: 'متأخر' } },
    ]);
  }

  private loadDashboard(dashboardId: number): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.analyticsService.getAvailableDashboards().pipe(
      takeUntil(this.destroy$),
      switchMap((dashboards) => {
        const dashboard = dashboards.find((d) => d.id === dashboardId) || null;
        this.dashboardSignal.set(dashboard);

        if (dashboard) {
          const dashboardType = this.extractDashboardType(dashboard.name);
          this.dashboardTypeSignal.set(dashboardType);
        } else {
          this.dashboardSignal.set({
            id: dashboardId,
            name: `Dashboard #${dashboardId}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        const hallIds = this.getEffectiveHallIds();
        const filters = this.buildFilters();

        return this.analyticsService.getDashboardUrl(dashboardId, hallIds, filters);
      }),
      tap({
        next: (response) => {
          const sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.url);
          this.dashboardUrlSignal.set(sanitizedUrl);
          this.loadingSignal.set(false);
          this.iframeLoadingSignal.set(true);
        },
        error: (error) => {
          this.loadingSignal.set(false);
          this.errorSignal.set('Failed to load dashboard. Please try again.');
          console.error('Dashboard loading error:', error);
        },
      })
    );
  }

  private extractDashboardType(dashboardName: string): DashboardTypes {
    const parts = dashboardName.split('/');

    if (parts.length > 1) {
      const englishPart = parts[0].trim();
      if (englishPart.toLowerCase().includes('booking')) {
        return DashboardTypes.Booking;
      } else if (englishPart.toLowerCase().includes('expense')) {
        return DashboardTypes.Expense;
      }
    }

    const name = dashboardName.toLowerCase();
    if (name.includes('booking') || name.includes('حج')) {
      return DashboardTypes.Booking;
    } else if (name.includes('expense') || name.includes('مصروف')) {
      return DashboardTypes.Expense;
    }

    return DashboardTypes.Booking;
  }

  private buildFilters(): DashboardFilters {
    const formValue = this.filtersForm.value;

    return {
      dashboardType: this.dashboardTypeSignal(),
      months: formValue.months,
      fromDate: formValue.fromDate,
      toDate: formValue.toDate,
      timeGranularity: formValue.timeGranularity,
      eventTypeId: formValue.eventTypeId,
      eventTime: formValue.eventTime,
      bookingProcessStatus: formValue.bookingProcessStatus,
      attendeesType: formValue.attendeesType,
      clientType: formValue.clientType,
      expenseStatus: formValue.expenseStatus,
      expenseType: formValue.expenseType,
      expenseCategory: formValue.expenseCategory,
      expenseItem: formValue.expenseItem,
    };
  }

  private getEffectiveHallIds(): number[] {
    const currentHall = this.hallsService.getCurrentHall();
    return currentHall ? [currentHall.id] : this.hallsService.halls.map(h => h.id);
  }

  private resetFiltersForDashboardType(): void {
    const dashboardType = this.dashboardTypeSignal();

    if (dashboardType === DashboardTypes.Booking) {
      this.filtersForm.patchValue({
        expenseStatus: null,
        expenseType: null,
        expenseCategory: null,
        expenseItem: null,
      });
    } else if (dashboardType === DashboardTypes.Expense) {
      this.filtersForm.patchValue({
        eventTypeId: null,
        eventTime: null,
        bookingProcessStatus: null,
        attendeesType: null,
        clientType: null,
      });
    }
  }

  onDurationSelect(duration: number): void {
    this.selectedFilterTypeSignal.set(duration.toString());
    this.showCustomDatesSignal.set(false);
    this.filtersForm.patchValue({
      months: duration,
      fromDate: null,
      toDate: null,
    });
  }

  onToggleCustomDates(): void {
    this.selectedFilterTypeSignal.set('custom');
    this.showCustomDatesSignal.set(true);
    this.filtersForm.patchValue({ months: null });
  }

  onApplyCustomDates(): void {
    if (this.customDatesForm.valid) {
      const { fromDate, toDate } = this.customDatesForm.value;
      this.filtersForm.patchValue({
        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate),
        months: null,
      });
    }
  }

  onClearCustomDates(): void {
    this.customDatesForm.reset();
    this.filtersForm.patchValue({
      fromDate: null,
      toDate: null,
    });
  }

  onToggleFilters(): void {
    this.filtersOpenSignal.update(current => !current);
  }

  onBackToDashboards(): void {
    this.router.navigate(['/analytics']);
  }

  onRefresh(): void {
    const dashboardId = this.dashboardIdSignal();
    if (dashboardId) {
      this.loadDashboard(dashboardId).subscribe();
    }
  }

  onFullscreen(): void {
    if (this.iframeElement && this.iframeElement.nativeElement.requestFullscreen) {
      this.iframeElement.nativeElement.requestFullscreen();
    }
  }

  onIframeLoad(): void {
    this.iframeLoadingSignal.set(false);
  }

  onIframeError(): void {
    this.iframeLoadingSignal.set(false);
    this.errorSignal.set('Failed to load dashboard content. The dashboard may be temporarily unavailable.');
  }
}

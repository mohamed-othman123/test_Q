import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, takeUntil, switchMap, of, Observable, tap, BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AIAnalyticsService, Dashboard, DashboardTypes, DashboardFilters } from '../../a-i-analytics.service';
import { HallsService } from '@halls/services/halls.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dateRangeValidator } from '@core/validators/date-range';
import { OrdersService } from '@orders/services/orders.service';
import { BookingFacadeService } from '@orders/services/booking-facade.service';
import { PurchasesService } from '@purchases/services/purchases.service';
import { ExpensesItemsService } from '@expenses-items/services/expenses-items.service';
import { Item } from '@core/models';
import { ExpensesType } from '@purchases/constants/purchase.constants';
import { LanguageService } from '@core/services';
import { formatDate } from '@shared/components/date-picker/helper/date-helper';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-viewer',
  templateUrl: './dashboard-viewer.component.html',
  styleUrls: ['./dashboard-viewer.component.scss'],
  standalone: false
})
export class DashboardViewerComponent implements OnInit, OnDestroy {
  @ViewChild('dashboardIframe', { static: false }) iframeElement!: ElementRef<HTMLIFrameElement>;

  dashboard: Dashboard | null = null;
  dashboardUrl: SafeResourceUrl | null = null;
  rawDashboardUrl: string | null = null;
  dashboardId: number | null = null;
  loading = true;
  error: string | null = null;
  iframeLoading = true;

  dashboardType: DashboardTypes = DashboardTypes.Booking;
  dashboardTypes = DashboardTypes;

  showFilters = true;
  showCustomDates = false;
  customDatesForm: FormGroup;
  currentSelectedFilterType$ = new BehaviorSubject<string>('1');

  eventTypes: any[] = [];
  eventTimes: Item[] = [];
  bookingStatuses: Item[] = [];
  attendeesTypes: Item[] = [];
  clientTypes: Item[] = [];

  expenseStatuses: Item[] = [];
  expenseTypes: Item[] = [];
  expenseCategories: any[] = [];
  expenseItems: any[] = [];

  filtersForm: FormGroup;

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
    public lang: TranslateService
  ) {
    this.customDatesForm = this.fb.group(
      {
        fromDate: [null, Validators.required],
        toDate: [null, Validators.required],
      },
      { validators: [dateRangeValidator('fromDate', 'toDate')] }
    );

    this.filtersForm = this.fb.group({
      // Common filters
      months: [1],
      fromDate: [null],
      toDate: [null],

      // Booking filters
      eventTypeId: [null],
      eventTime: [null],
      bookingProcessStatus: [null],
      attendeesType: [null],
      clientType: [null],

      // Expense filters
      expenseStatus: [null],
      expenseType: [null],
      expenseCategory: [null],
      expenseItem: [null],
    });
  }

  ngOnInit(): void {
    this.loadFilterOptions();

    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const id = params.get('id');
          if (id) {
            this.dashboardId = +id;
            return this.loadDashboard(this.dashboardId);
          }
          return of(null);
        })
      )
      .subscribe();

    this.filtersForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged((prev, curr) => {
          return JSON.stringify(prev) === JSON.stringify(curr);
        })
      )
      .subscribe(() => {
        if (this.dashboardId && !this.loading) {
          this.loadDashboard(this.dashboardId).subscribe();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private extractDashboardType(dashboardName: string): DashboardTypes {
    const parts = dashboardName.split('/');
    if (parts.length > 1) {
      const englishPart = parts[1].trim();
      if (englishPart.toLowerCase().includes('booking')) {
        return DashboardTypes.Booking;
      } else if (englishPart.toLowerCase().includes('expense')) {
        return DashboardTypes.Expense;
      }
    }

    const name = dashboardName.toLowerCase();
    if (name.includes('booking') || name.includes('حجز')) {
      return DashboardTypes.Booking;
    } else if (name.includes('expense') || name.includes('مصروف')) {
      return DashboardTypes.Expense;
    }

    return DashboardTypes.Booking;
  }

  private loadFilterOptions(): void {
    this.bookingFacadeService.getEvents().subscribe(events => {
      this.eventTypes = events.items;
    });

    this.ordersService.getEventTimes().subscribe(eventTimes => {
      this.eventTimes = eventTimes;
    });

    this.ordersService.getBookingStatus().subscribe(bookingStatuses => {
      this.bookingStatuses = bookingStatuses;
    });

    this.ordersService.getAttendeesTypes().subscribe(attendeesTypes => {
      this.attendeesTypes = attendeesTypes;
    });

    this.clientTypes = [
      { value: 'Individual', label: { en: 'Individual', ar: 'فرد' } },
      { value: 'Facility', label: { en: 'Facility', ar: 'منشأة' } },
      { value: 'Governmental Facility', label: { en: 'Governmental Facility', ar: 'منشأة حكومية' } }
    ];

    this.expenseTypes = ExpensesType;

    this.expenseStatuses = [
      { value: 'New', label: { en: 'New', ar: 'جديد' } },
      { value: 'Fully Paid', label: { en: 'Fully Paid', ar: 'مدفوع بالكامل' } },
      { value: 'Partially Paid', label: { en: 'Partially Paid', ar: 'مدفوع جزئياً' } },
      { value: 'Completed', label: { en: 'Completed', ar: 'مكتمل' } },
      { value: 'Canceled', label: { en: 'Canceled', ar: 'ملغي' } },
      { value: 'Late', label: { en: 'Late', ar: 'متأخر' } }
    ];
  }

  private loadDashboard(dashboardId: number): Observable<any> {
    this.loading = true;
    this.error = null;

    const hallIds = this.getEffectiveHallIds();
    const filters = this.buildFilters();

    return this.analyticsService.getDashboardUrl(dashboardId, hallIds, filters)
      .pipe(
        takeUntil(this.destroy$),
        tap({
          next: (response) => {
            this.rawDashboardUrl = response.url;
            this.dashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.url);
            this.loading = false;
            this.iframeLoading = true;
            this.loadDashboardMetadata(dashboardId);
          },
          error: (error) => {
            this.loading = false;
          }
        })
      );
  }

  private buildFilters(): DashboardFilters {
    const formValue = this.filtersForm.value;

    return {
      dashboardType: this.dashboardType,
      months: formValue.months,
      fromDate: formValue.fromDate,
      toDate: formValue.toDate,

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
    return currentHall ? [currentHall.id] : [];
  }

  private loadDashboardMetadata(dashboardId: number): void {
    this.analyticsService.getAvailableDashboards()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dashboards) => {
          this.dashboard = dashboards.find(d => d.id === dashboardId) || null;
          if (this.dashboard) {
            this.dashboardType = this.extractDashboardType(this.dashboard.name);

            this.resetFiltersForDashboardType();
          } else {
            this.dashboard = {
              id: dashboardId,
              name: `Dashboard #${dashboardId}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
        },
        error: (error) => {
        }
      });
  }

  private resetFiltersForDashboardType(): void {
    if (this.dashboardType === DashboardTypes.Booking) {
      this.filtersForm.patchValue({
        expenseStatus: null,
        expenseType: null,
        expenseCategory: null,
        expenseItem: null,
      }, { emitEvent: false });
    } else if (this.dashboardType === DashboardTypes.Expense) {
      this.filtersForm.patchValue({
        eventTypeId: null,
        eventTime: null,
        bookingProcessStatus: null,
        attendeesType: null,
        clientType: null,
      }, { emitEvent: false });
    }
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onDurationSelect(duration: number): void {
    this.filtersForm.patchValue({ 
      months: duration,
      fromDate: null,
      toDate: null
    });
    this.currentSelectedFilterType$.next(String(duration));
    this.showCustomDates = false;
  }

  toggleCustomDates(): void {
    this.currentSelectedFilterType$.next('custom');
    this.showCustomDates = true;
  }

  applyCustomDates(): void {
    if (this.customDatesForm.valid) {
      const { fromDate, toDate } = this.customDatesForm.value;
      
      const formattedFromDate = fromDate ? formatDate(fromDate) : null;
      const formattedToDate = toDate ? formatDate(toDate) : null;
      
      this.filtersForm.patchValue({ 
        fromDate: formattedFromDate, 
        toDate: formattedToDate 
      });
      this.showCustomDates = false;
    }
  }

  cancelCustomDates(): void {
    this.showCustomDates = false;
    this.customDatesForm.reset();
    this.onDurationSelect(1);
  }

  onExpenseTypeChange(): void {
    const expenseType = this.filtersForm.get('expenseType')?.value;
    if (expenseType) {
      this.purchasesService.getPurchaseCategoriesList({
        type: expenseType,
        hallId: this.hallsService.getCurrentHall()?.id
      }).subscribe(categories => {
        this.expenseCategories = categories.items;
      });
    }
  }

  onExpenseCategoryChange(): void {
    const categoryId = this.filtersForm.get('expenseCategory')?.value;
    if (categoryId) {
      this.expensesItemsService.getExpenseItems({
        categoryId,
        hallId: this.hallsService.getCurrentHall()?.id
      }).subscribe(items => {
        this.expenseItems = items.items;
      });
    }
  }

  onIframeLoad(): void {
    this.iframeLoading = false;
  }

  onIframeError(): void {
    this.iframeLoading = false;
  }

  onBackToDashboards(): void {
    this.router.navigate(['/analytics']);
  }

  onRefresh(): void {
    if (this.dashboardId) {
      this.loadDashboard(this.dashboardId).subscribe();
    }
  }

  onFullscreen(): void {
    if (this.iframeElement && this.iframeElement.nativeElement.requestFullscreen) {
      this.iframeElement.nativeElement.requestFullscreen();
    }
  }

  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  getCurrentHallInfo(): { name: string; id: number } | null {
    const currentHall = this.hallsService.getCurrentHall();
    return currentHall ? { name: currentHall.name, id: currentHall.id } : null;
  }

  isUsingHallContext(): boolean {
    return this.getEffectiveHallIds().length > 0;
  }
}

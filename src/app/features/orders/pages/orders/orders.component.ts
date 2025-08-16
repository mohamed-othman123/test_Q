import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataTableFilter, Item, TableData} from '@core/models';
import {TranslateService} from '@ngx-translate/core';
import {Booking} from '@orders/models/orders.model';
import {OrdersService} from '@orders/services/orders.service';
import {AuthService, FilterService, LanguageService} from '@core/services';
import {Filter} from '@core/interfaces';
import {HallsService} from '@halls/services/halls.service';
import {BookingFacadeService} from '@orders/services/booking-facade.service';
import {Table} from 'primeng/table';
import {ConfirmationService} from 'primeng/api';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';
import {PermissionsService} from '@core/services/permissions.service';
import {PermissionTypes} from '@auth/models';
import {ConfirmationModalService} from '@core/services/confirmation-modal.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  standalone: false,
})
export class OrdersComponent extends Filter implements OnInit, OnDestroy {
  @ViewChild('dt2')
  override dataTable!: Table;

  bookings: Booking[] = [];
  selectedItems: Booking[] = [];
  searchTerm: string = '';
  currentLang!: string;
  protected override filterConfig: {[key: string]: unknown} = {
    bookingReference: [null],
    bookingDate: [null], //TODO: to be removed
    startDate: [null],
    endDate: [null],
    eventTime: [null],
    clientName: [null],
    totalPayable: [null],
    eventType: [null],
    numberOfServices: [null],
    hallId: [this.hallsService.getCurrentHall()?.id],
    generalSearch: [null],
    bookingProcessStatus: [null],
  };
  tooltipVisible = false;

  bookingStatus: Item[] = [];

  eventTime: Item[] = [];

  statusTooltipVisible = false;
  selectedStatusItem: Booking | null = null;

  showDeleteConfirmation = false;
  selectedOrderId: number | null = null;

  constructor(
    public ordersService: OrdersService,
    private router: Router,
    protected override filterService: FilterService,
    private translate: TranslateService,
    public lang: LanguageService,
    private hallsService: HallsService,
    public bookingFacadeService: BookingFacadeService,
    private activatedRoute: ActivatedRoute,
    private confirmationService: ConfirmationService,
    public permissionsService: PermissionsService,
    public auth: AuthService,
    private confirmationModalService: ConfirmationModalService,
  ) {
    super(filterService);
  }

  override ngOnInit() {
    const sub = this.ordersService
      .getBookingStatus()
      .subscribe((bookingStatus) => (this.bookingStatus = bookingStatus));
    this.subs.add(sub);

    this.ordersService
      .getEventTimes()
      .subscribe((data) => (this.eventTime = data));

    super.ngOnInit();

    const hallSub = this.hallsService.currentHall$.subscribe((hall) => {
      const queryParamSubscription = this.activatedRoute.queryParams.subscribe(
        (params) => {
          this.searchTerm = params['search'];
          if (this.searchTerm) {
            this.filterForm.patchValue({
              hallId: hall?.id,
              generalSearch: this.searchTerm,
            });
          } else {
            this.filterForm.patchValue({
              hallId: hall?.id,
            });
          }
        },
      );
      this.subs.add(queryParamSubscription);
    });
    this.subs.add(hallSub);

    this.currentLang = this.translate.currentLang;
    const translateSub = this.translate.onLangChange.subscribe((lang) => {
      this.currentLang = lang.lang;
    });
    this.subs.add(translateSub);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.tooltipVisible = false;
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    const {startDate, endDate, ...restFilters} = filters;

    // if startDate is not null then check if it valid date and assign it to filters
    if (startDate) {
      restFilters['startDate'] = dateToGregorianIsoString(startDate, 'short');
    }

    // if endDate is not null then check if it valid date and assign it to filters
    if (endDate) {
      restFilters['endDate'] = dateToGregorianIsoString(endDate, 'short');
    }

    const sub = this.ordersService
      .getOrders({...restFilters, hallId: this.filterForm.get('hallId')?.value})
      .subscribe((bookings: TableData<Booking>) => {
        this.bookings = bookings.items;
        this.totalRecords = bookings.totalItems;
      });
    this.subs.add(sub);
  }

  editOrder(order: Booking) {
    this.router.navigate(['orders/add-new-order/edit'], {
      queryParams: {id: order.id},
    });
  }

  navigateToNewOrder(order?: Booking) {
    this.router.navigate(['orders/add-new-order']);
  }

  viewOrder(order: Booking) {
    this.router.navigate(['details-and-payment', order.id]);
  }

  paymentAndRefund(order: Booking, type: 'Refund' | 'Income') {
    this.router.navigate(['details-and-payment', 'add-new-payment', order.id], {
      state: order,
      queryParams: {
        type,
      },
    });
  }

  onClickStatus(order: Booking, event: MouseEvent) {
    event.stopPropagation();
    this.selectedStatusItem = order;
    this.statusTooltipVisible = true;
  }

  @HostListener('document:click')
  closeStatusTooltip() {
    this.statusTooltipVisible = false;
    this.selectedStatusItem = null;
  }

  toggleTooltip(e: MouseEvent) {
    e.stopPropagation();
    this.tooltipVisible = !this.tooltipVisible;
  }

  printPopup(event: Event, order: Booking) {
    const {id, hash} = order?.contractPdf!;

    this.confirmationModalService.show('print').subscribe({
      next: (res) => {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(['../contract/preview', id], {
            queryParams: {lang: res ? 'en' : 'ar', identity: hash},
            relativeTo: this.activatedRoute,
          }),
        );

        window.open(url, '_blank');
      },
    });
  }

  openDeleteConfirmation(id: number) {
    this.selectedOrderId = id;
    this.showDeleteConfirmation = true;
  }

  confirmDeleteOrder() {
    if (this.selectedOrderId) {
      this.ordersService.deleteOrders(this.selectedOrderId).subscribe(() => {
        this.loadDataTable(this.filters);
        this.selectedOrderId = null;
      });
      this.showDeleteConfirmation = false;
    }
  }

  rejectDeleteOrder(): void {
    this.selectedOrderId = null;
    this.showDeleteConfirmation = false;
  }

  hasPermissionTo(
    action: 'delete' | 'update' | 'view' | 'payment' | 'refund',
    order: Booking,
  ): boolean {
    const isOwner = order.created_by === this.auth.userData?.user?.userId;
    const canEdit =
      isOwner ||
      this.auth.userData?.user.permissionType === PermissionTypes.GENERAL;

    const isActive = order.bookingProcessStatus !== 'Canceled';
    const isConfirmed = order.isConfirmed;

    switch (action) {
      case 'delete':
        return (
          this.permissionsService.hasPermission('delete:bookings') &&
          canEdit &&
          isActive
        );
      case 'update':
        return (
          this.permissionsService.hasPermission('update:bookings') &&
          canEdit &&
          isActive
        );
      case 'view':
        return (
          this.permissionsService.hasPermission('read:bookings') && isActive
        );
      case 'payment':
        return (
          this.permissionsService.hasPermission('create:payments') &&
          isConfirmed &&
          canEdit &&
          isActive
        );
      case 'refund':
        return (
          this.permissionsService.hasPermission('create:refund request') &&
          isConfirmed &&
          canEdit &&
          order.paidAmount > 0
        );
      default:
        return false;
    }
  }
}

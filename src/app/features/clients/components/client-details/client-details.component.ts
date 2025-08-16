import {Component, OnInit, OnDestroy, ViewChild, HostListener} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {finalize, of, Subscription, switchMap, tap} from 'rxjs';
import {Client} from '@clients/models/client.model';
import {CustomersService} from '@clients/services/Customers.service';
import {OrdersService} from '@orders/services/orders.service';
import {Booking} from '@orders/models/orders.model';
import {TranslateService} from '@ngx-translate/core';
import {Table} from 'primeng/table';
import {DataTableFilter} from '@core/models';
import {FilterService, LanguageService} from '@core/services';
import {Filter} from '@core/interfaces';
import {HallsService} from '@halls/services/halls.service';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';

@Component({
    selector: 'app-client-details',
    templateUrl: './client-details.component.html',
    styleUrls: ['./client-details.component.scss'],
    standalone: false
})
export class ClientDetailsComponent
  extends Filter
  implements OnInit, OnDestroy
{
  @ViewChild('dt2')
  override dataTable!: Table;

  client: Client | null = null;
  bookings: Booking[] = [];
  selectedItems: Booking[] = [];
  currentLang!: string;
  isLoading = true;
  tooltipVisible = false;
  statusTooltipVisible = false;
  selectedStatusItem: Booking | null = null;

  protected override filterConfig: {[key: string]: unknown} = {
    bookingReference: [null],
    startDate: [null],
    endDate: [null],
    eventTime: [null],
    totalPayable: [null],
    bookingProcessStatus: [null],
    clientName: [null],
    hallId: [null],
    clientId: [null],
  };

  bookingStatus: any[] = [];
  eventTime: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customersService: CustomersService,
    public ordersService: OrdersService,
    private translate: TranslateService,
    protected override filterService: FilterService,
    public lang: LanguageService,
    public hallsService: HallsService,
  ) {
    super(filterService);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.ordersService.getBookingStatus().subscribe(s => (this.bookingStatus = s));
    this.ordersService.getEventTimes().subscribe(t => (this.eventTime = t));

    const clientId = +this.route.snapshot.params['id'];
    if (clientId) {
      this.loadClientDetails(clientId);
    }

    this.currentLang = this.translate.currentLang;
    this.subs.add(
      this.translate.onLangChange.subscribe(lang => (this.currentLang = lang.lang))
    );
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.tooltipVisible = false;
  }

  @HostListener('document:click')
  closeStatusTooltip() {
    this.statusTooltipVisible = false;
    this.selectedStatusItem = null;
  }

  loadClientDetails(clientId: number): void {
    this.isLoading = true;

    this.customersService.getClientById(clientId).subscribe({
      next: (client) => {
        this.client = client;

        this.filterForm.patchValue({
          clientId: client.id,
          hallId:   this.hallsService.getCurrentHall()?.id
        });

        this.loadDataTable(this.filterForm.value as DataTableFilter);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/clients']);
      }
    });
  }



  protected override loadDataTable(filters: DataTableFilter): void {
    const { startDate, endDate, ...rest } = filters;
    if (startDate) {
      rest['startDate'] = dateToGregorianIsoString(startDate, 'short');
    }
    if (endDate) {
      rest['endDate'] = dateToGregorianIsoString(endDate, 'short');
    }
    rest['hallId']   = this.hallsService.getCurrentHall()?.id;
    rest['clientId'] = this.client?.id;

    const sub = this.ordersService.getOrders(rest).subscribe(res => {
      this.bookings     = res.items;
      this.totalRecords = res.totalItems;
    });
    this.subs.add(sub);
  }



  viewOrder(order: Booking): void {
    this.router.navigate(['/orders/details-and-payment', order.id]);
  }

  onClickStatus(order: Booking, event: MouseEvent) {
    event.stopPropagation();
    this.selectedStatusItem = order;
    this.statusTooltipVisible = true;
  }

  toggleTooltip(e: MouseEvent) {
    e.stopPropagation();
    this.tooltipVisible = !this.tooltipVisible;
  }

  navigateBack(): void {
    this.router.navigate(['/clients']);
  }

  override ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

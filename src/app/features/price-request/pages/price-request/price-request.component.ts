import {Component, OnInit, ViewChild} from '@angular/core';
import {Filter} from '@core/interfaces';
import {DataTableFilter, Item, TableData} from '@core/models';
import {FilterService, LanguageService} from '@core/services';
import {Hall} from '@halls/models/halls.model';
import {PriceRequestService} from '../../services/price-request.service';
import {PriceRequest} from '../../models';
import {HallsService} from '@halls/services/halls.service';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {format, isValid} from 'date-fns';
import {convertDateToArabic} from '@core/utils';
import {Table} from 'primeng/table';

@Component({
    selector: 'app-price-request',
    templateUrl: './price-request.component.html',
    styleUrl: './price-request.component.scss',
    standalone: false
})
export class PriceRequestComponent extends Filter implements OnInit {
  @ViewChild('dt2')
  override dataTable!: Table;

  priceRequests!: PriceRequest[];

  currentHall: Hall | null = null;

  priceRequestStatus: Item[] = [];

  protected override filterConfig: {[key: string]: unknown} = {
    name: [null],
    eventDate: [null],
    eventName: [null],
    status: [null],
    creationDate: [null],
    hallId: [null],
  };

  showDeleteConfirmation = false;
  selectedPriceRequestId: number | null = null;

  constructor(
    protected override filterService: FilterService,
    private priceRequestService: PriceRequestService,
    private hallsService: HallsService,
    public lang: LanguageService,
    private translate: TranslateService,
    private router: Router,
  ) {
    super(filterService);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    const hallSub = this.hallsService.currentHall$.subscribe((hall) => {
      this.currentHall = hall;
      if (hall) {
        this.filterForm.get('hallId')?.setValue(hall.id);
        this.refreshData();
      }
    });
    this.subs.add(hallSub);

    this.priceRequestService.getPriceRequestStatus().subscribe((data) => {
      this.priceRequestStatus = data;
    });
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    if (!this.currentHall) return;

    const {creationDate, eventDate, ...restFilters} = filters;

    if (creationDate) {
      const date = new Date(
        creationDate.year,
        creationDate.month - 1,
        creationDate.day,
      );

      if (isValid(date)) {
        restFilters['creationDate'] = format(date, 'yyyy-MM-dd');
      }
    }

    if (eventDate) {
      const date = new Date(eventDate.year, eventDate.month - 1, eventDate.day);

      if (isValid(date)) {
        restFilters['eventDate'] = format(date, 'yyyy-MM-dd');
      }
    }

    const queryFilters = {
      ...restFilters,
      hallId: this.currentHall.id,
    };

    const sub = this.priceRequestService
      .getPriceRequests(queryFilters)
      .subscribe((priceRequests: TableData<PriceRequest>) => {
        this.priceRequests = priceRequests.items;
        this.totalRecords = priceRequests.totalItems;
      });
    this.subs.add(sub);
  }

  refreshData() {
    this.loadDataTable(this.filters);
  }

  getMenuItems(priceRequest: PriceRequest) {
    return [
      {
        label: this.translate.instant('common.edit'),
        icon: 'pi pi-pencil',
        command: () =>
          this.router.navigate(['price-requests/edit', priceRequest.id]),
        style: {color: '#00837B', direction: 'rtl'},
      },
      {
        label: this.translate.instant('common.view'),
        icon: 'pi pi-eye',
        command: () =>
          this.router.navigate(['price-requests/view', priceRequest.id]),
        style: {color: '#806520', direction: 'rtl'},
      },
    ];
  }

  updatePriceRequest(priceRequest: PriceRequest) {
    this.router.navigate(['price-requests/edit', priceRequest.id]);
  }
  viewPriceRequest(priceRequest: PriceRequest) {
    this.router.navigate(['price-requests/view', priceRequest.id]);
  }
  openDeleteConfirmation(priceRequest: PriceRequest) {
    this.selectedPriceRequestId = priceRequest.id;
    this.showDeleteConfirmation = true;
  }
  confirmDeletePriceRequest() {
    this.priceRequestService
      .deletePriceRequestById(this.selectedPriceRequestId!)
      .subscribe(() => {
        this.refreshData();
        this.selectedPriceRequestId = null;
        this.showDeleteConfirmation = false;
      });
  }
  rejectDeletePriceRequest() {
    this.selectedPriceRequestId = null;
    this.showDeleteConfirmation = false;
  }

  dateToArabic(date: string) {
    return convertDateToArabic(date);
  }

  // confirmDeletePriceRequest(priceRequest: PriceRequest) {
  //   this.priceRequestService
  //     .deletePriceRequestById(priceRequest.id)
  //     .subscribe(() => {
  //       this.refreshData();
  //     });
  // }
}

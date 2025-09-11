import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Filter} from '@core/interfaces';
import {DataTableFilter} from '@core/models';
import {FilterService, LanguageService} from '@core/services';
import {bookingItem} from '@orders/models';
import {BookingCostService} from '@orders/services/booking-cost.service';
import {Table} from 'primeng/table';

@Component({
  selector: 'app-services-cost',
  standalone: false,
  templateUrl: './services-cost.component.html',
  styleUrl: './services-cost.component.scss',
})
export class ServicesCostComponent extends Filter {
  @Output() serviceCost = new EventEmitter<number>();

  @ViewChild('dt2')
  override dataTable!: Table;

  protected override filterConfig: {[key: string]: unknown} = {
    type: ['service'],
  };

  bookingId: number;

  services: bookingItem[] = [];

  totalServiceCost: number = 0;

  constructor(
    public lang: LanguageService,
    private bookingCostService: BookingCostService,
    protected override filterService: FilterService,
    private route: ActivatedRoute,
  ) {
    super(filterService);
    this.bookingId = Number(this.route.snapshot.paramMap.get('id'));
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    this.bookingCostService
      .getBookingItems(filters, this.bookingId)
      .subscribe((res) => {
        this.totalRecords = res.totalItems;
        this.services = res.items;
        this.calculatedTotalServiceCost(this.services);
      });
  }

  calculatedTotalServiceCost(services: bookingItem[] = []) {
    this.totalServiceCost = services.reduce((acc, item) => {
      return acc + (item.cost || 0);
    }, 0);

    this.serviceCost.emit(this.totalServiceCost);
  }
}

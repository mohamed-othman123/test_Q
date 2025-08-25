import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Filter} from '@core/interfaces';
import {DataTableFilter} from '@core/models';
import {FilterService, LanguageService} from '@core/services';
import {HallsService} from '@halls/services/halls.service';
import {BookingDetails} from '@orders/models';
import {RefundRequest} from '@refund-requests/models/refund-request.model';
import {RefundRequestsService} from '@refund-requests/services/refund-request.service';

@Component({
  selector: 'app-refund-list',
  standalone: false,
  templateUrl: './refund-list.component.html',
  styleUrl: './refund-list.component.scss',
})
export class RefundListComponent extends Filter {
  bookingDetails: BookingDetails;
  protected override filterConfig: {[key: string]: unknown};
  refunds: RefundRequest[] = [];

  constructor(
    protected override filterService: FilterService,
    private activatedRoute: ActivatedRoute,
    private refundRequestsService: RefundRequestsService,
    public lang: LanguageService,
    private hallsService: HallsService,
    private router: Router,
  ) {
    super(filterService);

    const resolvedData = activatedRoute.snapshot.data['resolvedData'];
    this.bookingDetails = resolvedData.bookingDetails;

    this.filterConfig = {
      hallId: [hallsService.getCurrentHall()?.id],
      bookingReference: [this.bookingDetails.bookingReference],
    };
  }

  protected override loadDataTable(filters: DataTableFilter) {
    this.refundRequestsService.getAll(filters).subscribe((response) => {
      this.refunds = response.items;
      this.totalRecords = response.totalItems;
    });
  }

  viewRequest(refund: RefundRequest) {
    this.router.navigate(['refund-requests/view/', refund.id]);
  }

  editRequest(refund: RefundRequest) {
    this.router.navigate(['refund-requests/edit/', refund.id]);
  }
}

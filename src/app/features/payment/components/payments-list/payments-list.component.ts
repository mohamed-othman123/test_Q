import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Filter} from '@core/interfaces';
import {DataTableFilter} from '@core/models';
import {LanguageService} from '@core/services';
import {FilterService} from '@core/services/filter.service';
import {HallsService} from '@halls/services/halls.service';
import {TranslateService} from '@ngx-translate/core';
import {PrintTemplate} from '@orders/enums/print.enum';
import {BookingDetails} from '@orders/models';
import {Payment} from '@payment/models/payment.model';
import {PaymentService} from '@payment/services/payment.service';
import {ConfirmationService} from 'primeng/api';

@Component({
  selector: 'app-payments-list',
  standalone: false,
  templateUrl: './payments-list.component.html',
  styleUrl: './payments-list.component.scss',
})
export class PaymentsListComponent extends Filter {
  bookingDetails: BookingDetails;
  protected override filterConfig: {[key: string]: unknown};
  payments: Payment[] = [];

  constructor(
    protected override filterService: FilterService,
    private paymentService: PaymentService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    public lang: LanguageService,
    private hallsService: HallsService,
  ) {
    super(filterService);

    const resolvedData = activatedRoute.snapshot.data['resolvedData'];
    this.bookingDetails = resolvedData.bookingDetails;

    this.filterConfig = {
      hallId: [hallsService.getCurrentHall()?.id],
      bookingId: [this.bookingDetails.id],
    };
  }

  protected override loadDataTable(filters: DataTableFilter) {
    this.paymentService.getPayments(filters).subscribe((response) => {
      this.payments = response.items;
      this.totalRecords = response.totalItems;
    });
  }

  printReceipt(event: Event, payment: any) {
    const {id, hash} = payment?.receiptPdf!;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translate.instant('orders.printReceipt'),
      icon: 'pi pi-print',
      acceptLabel: this.translate.instant('orders.printAr'),
      rejectLabel: this.translate.instant('orders.printEn'),
      acceptButtonStyleClass: 'accept-arabic',
      accept: () => {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(
            [`../../`, PrintTemplate.RECEIPT, 'preview', id?.toString()],
            {
              queryParams: {lang: 'ar', identity: hash},
              relativeTo: this.activatedRoute,
            },
          ),
        );

        window.open(url, '_blank');
      },
      reject: () => {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(
            [`../../`, PrintTemplate.RECEIPT, 'preview', id?.toString()],
            {
              queryParams: {lang: 'en', identity: hash},
              relativeTo: this.activatedRoute,
            },
          ),
        );

        window.open(url, '_blank');
      },
    });
  }

  refreshDataTable(): void {
    this.loadDataTable(this.filters);
  }
}

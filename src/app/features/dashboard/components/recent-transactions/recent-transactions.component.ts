import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Filter} from '@core/interfaces';
import {DataTableFilter} from '@core/models';
import {FilterService} from '@core/services';
import {DashboardPayment} from '@dashboard/models/dashboard.model';
import {DashboardFacadeService} from '@dashboard/services/dashboard-facade.service';
import {DashboardService} from '@dashboard/services/dashboard.service';
import {HallsService} from '@halls/services/halls.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-recent-transactions',
    templateUrl: './recent-transactions.component.html',
    styleUrl: './recent-transactions.component.scss',
    standalone: false
})
export class RecentTransactionsComponent
  extends Filter
  implements OnInit, OnDestroy
{
  transactionFilterType$ = this.dashboardFacade.transactionFilterType$;

  payments!: DashboardPayment[];

  protected override filterConfig: {[key: string]: unknown} = {
    months: [this.dashboardFacade.months$.value],
    filter: [this.dashboardFacade.transactionFilterType$.value],
    fromDate: [null],
    toDate: [null],
    hallId: [this.hallsService.getCurrentHall()?.id],
  };

  override rows: number = 5;
  override rowsPerPageOptions: number[] = [5, 10, 20];

  constructor(
    private dashboardFacade: DashboardFacadeService,
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    protected override filterService: FilterService,
    private hallsService: HallsService,
    private translate: TranslateService,
  ) {
    super(filterService);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    const sub = this.dashboardFacade.payments$.subscribe(
      ({months, customizeDate, filter}) => {
        this.filters = {
          page: 1,
          limit: this.rows,
        };
        this.filterForm.setValue({
          months,
          filter,
          fromDate: customizeDate.fromDate ? customizeDate.fromDate : null,
          toDate: customizeDate.toDate ? customizeDate.toDate : null,
          hallId: this.hallsService.getCurrentHall()?.id,
        });
      },
    );
    this.subs.add(sub);
  }

  protected override loadDataTable(filters: DataTableFilter) {
    const sub = this.dashboardService
      .getDashboardPayments({
        ...filters,
      })
      .subscribe((res) => {
        this.payments = res.items;
        this.totalRecords = res.totalItems;
      });

    this.subs.add(sub);
  }

  operationType(payment: DashboardPayment) {
    if (payment.source === 'payment' && payment.paymentType === 'Income') {
      return this.translate.instant('dashboard.income');
    } else if (
      payment.source === 'payment' &&
      payment.paymentType === 'Refund'
    ) {
      return this.translate.instant('dashboard.refund');
    } else if (
      payment.source === 'purchase_payment' &&
      payment.paymentType === 'Income'
    ) {
      return this.translate.instant('dashboard.refund');
    } else if (
      payment.source === 'purchase_payment' &&
      payment.paymentType === 'Refund'
    ) {
      return this.translate.instant('dashboard.income');
    }
  }
}

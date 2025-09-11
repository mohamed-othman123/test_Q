import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {
  TRANSACTION_SOURCE,
  TRANSACTION_TYPE,
} from '@audit-transactions/constants/inventory.constants';
import {Filter} from '@core/interfaces';
import {
  AuditTransaction,
  AuditTransactionParams,
  DataTableFilter,
  Item,
  Source,
} from '@core/models';
import {
  AuditTransactionsService,
  FilterService,
  LanguageService,
} from '@core/services';
import {stringifyDate} from '@shared/components/date-picker/helper/date-helper';
import moment from 'moment';

@Component({
  selector: 'app-audit-transactions-list',
  standalone: false,
  templateUrl: './audit-transactions-list.component.html',
  styleUrl: './audit-transactions-list.component.scss',
})
export class AuditTransactionsListComponent extends Filter implements OnInit {
  @Input({required: true}) source!: Source;
  @Input({required: true}) sourceId!: string;
  @Input({required: true}) hallId!: string;
  @Input() hideSourceColumn: boolean = false;

  transactionsList: AuditTransaction[] = [];

  transactionSource: Item[] = TRANSACTION_SOURCE;
  transactionType: Item[] = TRANSACTION_TYPE;

  protected override filterConfig: {[key: string]: unknown} = {
    oldQuantity: [null],
    quantity: [null],
    currentQuantity: [null],
    creationDate: [null],
    transactionId: [null],
    transactionSource: [null],
    transactionType: [null],
    name: [null],
  };

  constructor(
    protected override filterService: FilterService,
    private auditTransactionsService: AuditTransactionsService,
    public lang: LanguageService,
    private router: Router,
  ) {
    super(filterService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    const {creationDate} = filters;

    const allFilters: AuditTransactionParams = {
      ...filters,
      source: this.source,
      sourceId: this.sourceId,
      hallId: this.hallId,
    };

    if (creationDate) {
      const date = stringifyDate(creationDate);
      if (!moment(date).isValid()) return;

      allFilters['creationDate'] = date;
    }

    this.auditTransactionsService
      .getAllTransactions(allFilters)
      .subscribe((data) => {
        this.transactionsList = data.items;
        this.totalRecords = data.totalItems;
      });
  }

  viewTransaction(id: string): void {
    this.router.navigate(['audit-transactions/view', id], {
      queryParams: {
        source: this.source,
        hallId: this.hallId,
      },
    });
  }

  refreshData(): void {
    this.loadDataTable(this.filters);
  }
}

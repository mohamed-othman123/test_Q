import { HttpClient, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GaConfigService} from '@core/analytics/ga-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {DataTableFilter, GaCustomEvents, TableData} from '@core/models';
import {NotificationService} from '@core/services';
import {ApiConfigService} from '@core/services/api-config.service';
import {ExpensesElement, ExpensesItem} from '@expenses-items/models';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpensesItemsService {
  module = 'expenses-items';
  apiExpensesItemsUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private apiConfigService: ApiConfigService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  addExpenseItem(payload: ExpensesItem) {
    const url = `${this.apiExpensesItemsUrl}`;
    return this.http.post<ExpensesItem>(url, payload).pipe(
      tap(() => {
        this.notificationService.showSuccess('expensesItems.itemAdded');

        this.gtag.event(GaCustomEvents.CREATE_EXPENSE_ITEM, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });
      }),
    );
  }

  updateExpenseItem(payload: ExpensesItem, id: number) {
    const url = `${this.apiExpensesItemsUrl}/${id}`;
    return this.http
      .patch<ExpensesItem>(url, payload)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('expensesItems.itemUpdated'),
        ),
      );
  }

  getExpenseItemById(id: number) {
    const url = `${this.apiExpensesItemsUrl}/${id}`;
    return this.http.get<ExpensesItem>(url);
  }

  getExpenseElements(filters: DataTableFilter) {
    const params = new HttpParams({fromObject: filters});
    const url = `${this.apiExpensesItemsUrl}/elements`;
    return this.http.get<TableData<ExpensesElement>>(url, {params});
  }

  getExpenseItems(filters: DataTableFilter) {
    const params = new HttpParams({fromObject: filters});
    const url = `${this.apiExpensesItemsUrl}`;
    return this.http.get<TableData<ExpensesItem>>(url, {params});
  }
  deleteExpenseItem(id: string) {
    const url = `${this.apiExpensesItemsUrl}/${id}`;
    return this.http
      .delete(url)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('expensesItems.itemDeleted'),
        ),
      );
  }
}

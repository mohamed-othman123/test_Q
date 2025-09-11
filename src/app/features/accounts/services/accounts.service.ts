import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AccountData, AccountNode} from '@accounts/models/accounts';
import {DataTableFilter, TableData} from '@core/models';
import {NotificationService} from '@core/services';
import {ApiConfigService} from '@core/services/api-config.service';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private module = 'chart';
  private apiAccountsUrl = this.apiConfigService.getApiBaseUrl(
    this.module as any,
  );

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
    private notificationService: NotificationService,
  ) {}

  getAccountList(filters: DataTableFilter) {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<AccountData>>(
      `${this.apiAccountsUrl}/accounts`,
      {params},
    );
  }

  getAccountById(id: number) {
    return this.http.get<AccountData>(`${this.apiAccountsUrl}/accounts/${id}`);
  }

  getAccountsTree(filters: DataTableFilter) {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<AccountNode[]>(
      `${this.apiAccountsUrl}/accounts/tree`,
      {params},
    );
  }

  createNewAccount(data: AccountData) {
    return this.http
      .post<AccountData>(`${this.apiAccountsUrl}/accounts`, data)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess(
            'chartOfAccounts.addedSuccessfully',
          );
        }),
      );
  }

  updateAccount(id: number, data: AccountData) {
    return this.http
      .patch<AccountData>(`${this.apiAccountsUrl}/accounts/${id}`, data)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess(
            'chartOfAccounts.updatedSuccessfully',
          );
        }),
      );
  }

  deleteAccount(id: number) {
    return this.http.delete(`${this.apiAccountsUrl}/accounts/${id}`).pipe(
      tap(() => {
        this.notificationService.showSuccess(
          'chartOfAccounts.deletedSuccessfully',
        );
      }),
    );
  }
}

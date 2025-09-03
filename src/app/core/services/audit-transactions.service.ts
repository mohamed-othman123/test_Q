import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ApiConfigService} from './api-config.service';
import {
  AuditTransaction,
  AuditTransactionParams,
  TableData,
} from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class AuditTransactionsService {
  private module = 'audit-transactions';
  private apiTransactionsUrl = this.apiConfigService.getApiBaseUrl(
    this.module as any,
  );

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
  ) {}

  getAllTransactions(queryParams: AuditTransactionParams) {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<TableData<AuditTransaction>>(this.apiTransactionsUrl, {
      params,
    });
  }

  getTransactionById(queryParams: AuditTransactionParams) {
    const params = new HttpParams({fromObject: queryParams});

    const url = `${this.apiTransactionsUrl}/${queryParams.sourceId}`;
    return this.http.get<AuditTransaction>(url, {params});
  }
}

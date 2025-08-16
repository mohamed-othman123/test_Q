import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {NotificationService} from '@core/services/notification.service';
import {tap} from 'rxjs/operators';
import {TableData, DataTableFilter, GaCustomEvents} from '@core/models';
import {
  PurchasePayment,
  PurchasePaymentForm,
} from '@paymentmethods/models/payment.model';
import {ApiConfigService} from '@core/services/api-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {GaConfigService} from '@core/analytics/ga-config.service';

interface EBank {
  name: string;
  name_ar: string;
}

@Injectable({
  providedIn: 'root',
})
export class PurchasePaymentsService {
  module = 'expense-payments';
  apiExpensePaymentsUrl = this.apiConfigService.getApiBaseUrl(
    this.module as any,
  );

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private apiConfigService: ApiConfigService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getPayments(
    filters: DataTableFilter,
  ): Observable<TableData<PurchasePayment>> {
    return this.http.get<TableData<PurchasePayment>>(
      this.apiExpensePaymentsUrl,
      {params: filters},
    );
  }

  getPayment(id: number): Observable<PurchasePayment> {
    return this.http.get<PurchasePayment>(
      `${this.apiExpensePaymentsUrl}/${id}`,
    );
  }

  createPayment(payment: PurchasePaymentForm): Observable<PurchasePayment> {
    return this.http
      .post<PurchasePayment>(this.apiExpensePaymentsUrl, payment)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('purchases.payment_added');

          this.gtag.event(GaCustomEvents.CREATE_EXPENSE_PAYMENT, {
            organizationInfo: this.gaConfig.getOrganizationInfo(),
            hallInfo: this.gaConfig.getHallInfo(),
          });
        }),
      );
  }

  updatePayment(
    id: number,
    payment: Partial<PurchasePayment>,
  ): Observable<PurchasePayment> {
    return this.http
      .patch<PurchasePayment>(`${this.apiExpensePaymentsUrl}/${id}`, payment)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('purchases.payment_updated'),
        ),
      );
  }

  deletePayment(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiExpensePaymentsUrl}/${id}`)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('purchases.payment_deleted'),
        ),
      );
  }

  getEBanks(): Observable<EBank[]> {
    return this.http.get<EBank[]>(
      `${this.apiConfigService.getApiBaseUrl('bank')}/ebanks`,
    );
  }
}

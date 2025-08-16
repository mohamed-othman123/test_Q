import { HttpClient, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DataTableFilter, GaCustomEvents, Item, TableData} from '@core/models';
import {} from '@employees/models/employee.model';
import {PaymentMethod} from '@paymentmethods/models/payment.model';
import {Observable, switchMap, tap} from 'rxjs';
import {NotificationService} from '@core/services/notification.service';
import {HallsService} from '@halls/services/halls.service';
import {ApiConfigService} from '@core/services/api-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {GaConfigService} from '@core/analytics/ga-config.service';

@Injectable({providedIn: 'root'})
export class PaymentMethodsService {
  module = 'payment-method';
  apiPaymentMethodsUrl = this.apiConfigService.getApiBaseUrl(
    this.module as any,
  );

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private hallServices: HallsService,
    private apiConfigService: ApiConfigService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getListPaymentMethods(
    filters?: DataTableFilter,
  ): Observable<TableData<PaymentMethod>> {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<PaymentMethod>>(this.apiPaymentMethodsUrl, {
      params,
    });
  }

  getPaymentMethodsListForCurrentHall() {
    return this.hallServices.currentHall$.pipe(
      switchMap((hall) => this.getListPaymentMethods({hallId: hall?.id})),
    );
  }

  addPaymentMethod(
    paymentMethod: PaymentMethod,
  ): Observable<TableData<PaymentMethod>> {
    return this.http
      .post<TableData<PaymentMethod>>(this.apiPaymentMethodsUrl, paymentMethod)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess(
            'paymentMethods.payment_method_added',
          );

          this.gtag.event(GaCustomEvents.CREATE_PAYMENT_METHOD, {
            organizationInfo: this.gaConfig.getOrganizationInfo(),
            hallInfo: this.gaConfig.getHallInfo(),
          });
        }),
      );
  }

  updatePaymentMethod(
    id: number,
    paymentMethod: PaymentMethod,
  ): Observable<TableData<PaymentMethod>> {
    return this.http
      .patch<
        TableData<PaymentMethod>
      >(`${this.apiPaymentMethodsUrl}/${id}`, paymentMethod)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess(
            'paymentMethods.payment_method_updated',
          ),
        ),
      );
  }

  deletePaymentMethod(id: number) {
    return this.http
      .delete(`${this.apiPaymentMethodsUrl}/${id}`)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess(
            'paymentMethods.payment_method_deleted',
          ),
        ),
      );
  }

  getPaymentTypeOptions(): Observable<Item[]> {
    return this.http.get<Item[]>('assets/lovs/payment-types.json');
  }
}

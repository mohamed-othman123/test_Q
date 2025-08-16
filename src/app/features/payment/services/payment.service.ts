import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GaCustomEvents, Item} from '@core/models';
import {Observable, tap} from 'rxjs';
import {Payment} from '../models/payment.model';
import {Booking} from '@orders/models/orders.model';
import {LanguageService} from '@core/services/language.service';
import {NotificationService} from '@core/services/notification.service';
import {ApiConfigService} from '@core/services/api-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {GaConfigService} from '@core/analytics/ga-config.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  module = 'payment';
  apiPaymentUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private languageService: LanguageService,
    private notificationService: NotificationService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getPayments(filters?: any): Observable<any> {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams
      ? `${this.apiPaymentUrl}?${queryParams}`
      : this.apiPaymentUrl;

    return this.http.get<Payment>(url);
  }

  //this method deleted from backend
  // deletePayment(id: number) {
  //   return this.http
  //     .delete(`${this.apiPaymentUrl}/${id}`)
  //     .pipe(
  //       tap(() =>
  //         this.notificationService.showSuccess('payment.payment_deleted'),
  //       ),
  //     );
  // }

  getPaymentTypes() {
    return this.http.get<Item[]>('assets/lovs/paymentTypes.json');
  }

  getBookingById(bookingId: number) {
    const url = `${this.apiConfigService.getApiBaseUrl('booking')}/${bookingId}`;
    return this.http.get<Booking>(url);
  }

  getPaymentById(paymentId: number) {
    const url = `${this.apiPaymentUrl}/${paymentId}`;
    return this.http.get<Payment>(url);
  }

  addNewPayment(payload: any) {
    return this.http.post(this.apiPaymentUrl, payload).pipe(
      tap(() => {
        this.notificationService.showSuccess('payment.payment_added');

        this.gtag.event(GaCustomEvents.CREATE_BOOKING_PAYMENT, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });
      }),
    );
  }

  //this method deleted from backend
  editPayment(paymentId: number, payload: any) {
    const url = `${this.apiPaymentUrl}/${paymentId}`;
    return this.http
      .patch(url, payload)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('payment.payment_updated'),
        ),
      );
  }
}

import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DataTableFilter, TableData} from '@core/models';
import {NotificationService} from '@core/services';
import {ApiConfigService} from '@core/services/api-config.service';
import {bookingItem} from '@orders/models';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingCostService {
  private module = 'booking';
  private apiBookingUrl = this.apiConfigService.getApiBaseUrl(
    this.module as any,
  );

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
  ) {}

  getBookingItems(filters: DataTableFilter, bookingId: number) {
    const params = new HttpParams({fromObject: filters});

    return this.http.get<TableData<bookingItem>>(
      `${this.apiBookingUrl}/${bookingId}/costs/items`,
      {
        params,
      },
    );
  }

  addProduct(payload: bookingItem, bookingId: number) {
    return this.http
      .post(`${this.apiBookingUrl}/${bookingId}/costs/items`, payload)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess(
            'orders.productAddedSuccessfully',
          );
        }),
      );
  }

  updateProduct(payload: bookingItem, bookingId: number, itemId: number) {
    return this.http
      .patch(
        `${this.apiBookingUrl}/${bookingId}/costs/items/${itemId}`,
        payload,
      )
      .pipe(
        tap(() => {
          this.notificationService.showSuccess(
            'orders.productUpdatedSuccessfully',
          );
        }),
      );
  }

  deleteProduct(bookingId: number, itemId: number) {
    return this.http
      .delete(`${this.apiBookingUrl}/${bookingId}/costs/items/${itemId}`)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess(
            'orders.productDeletedSuccessfully',
          );
        }),
      );
  }
}

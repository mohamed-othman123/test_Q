import { HttpClient, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DataTableFilter, GaCustomEvents, Item, TableData} from '@core/models';
import {NotificationService} from '@core/services';
import {PriceRequest} from '../models';
import {Subject, tap} from 'rxjs';
import {ApiConfigService} from '@core/services/api-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {GaConfigService} from '@core/analytics/ga-config.service';

@Injectable({
  providedIn: 'root',
})
export class PriceRequestService {
  module = 'booking-price-requests';
  apiPriceRequestUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  updatePriceCount$ = new Subject<number>();

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
    private notificationService: NotificationService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getPriceRequests(filters?: DataTableFilter) {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<PriceRequest>>(this.apiPriceRequestUrl, {
      params,
    });
  }

  getPriceRequestById(id: number) {
    const url = `${this.apiPriceRequestUrl}/${id}`;
    return this.http.get<PriceRequest>(url);
  }

  updatePriceRequestById(id: number, payload: Partial<PriceRequest>) {
    const url = `${this.apiPriceRequestUrl}/${id}`;
    return this.http.patch(url, payload).pipe(
      tap(() => {
        this.notificationService.showSuccess('priceRequest.recordUpdated'),
          this.updatePriceCount$.next(1);

        this.gtag.event(GaCustomEvents.UPDATE_PRICE_REQUEST, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });
      }),
    );
  }

  deletePriceRequestById(id: number) {
    const url = `${this.apiPriceRequestUrl}/${id}`;
    return this.http
      .delete(url)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('priceRequest.recordDeleted'),
        ),
      );
  }

  getPriceRequestStatus() {
    const url = 'assets/lovs/price-request-status.json';
    return this.http.get<Item[]>(url);
  }
}

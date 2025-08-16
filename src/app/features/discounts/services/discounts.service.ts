import { HttpClient, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GaConfigService} from '@core/analytics/ga-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {DataTableFilter, GaCustomEvents, TableData} from '@core/models';
import {NotificationService} from '@core/services';
import {ApiConfigService} from '@core/services/api-config.service';
import {Discount} from '@discounts/models/discounts.model';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DiscountsService {
  private module = 'discounts';
  private apiDiscountsUrl = this.apiConfigService.getApiBaseUrl(
    this.module as any,
  );

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
    private notificationService: NotificationService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getAllDiscounts(filters?: DataTableFilter) {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<Discount>>(this.apiDiscountsUrl, {params});
  }

  addNewDiscount(discount: Discount) {
    return this.http.post<Discount>(this.apiDiscountsUrl, discount).pipe(
      tap(() => {
        this.notificationService.showSuccess('discounts.discountAdded');

        this.gtag.event(GaCustomEvents.CREATE_DISCOUNT, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });
      }),
    );
  }

  updateDiscount(discount: Discount) {
    return this.http
      .patch<Discount>(`${this.apiDiscountsUrl}/${discount.id}`, discount)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('discounts.discountUpdated');
        }),
      );
  }

  deleteDiscount(id: number) {
    return this.http.delete(`${this.apiDiscountsUrl}/${id}`).pipe(
      tap(() => {
        this.notificationService.showSuccess('discounts.discountDeleted');
      }),
    );
  }
}

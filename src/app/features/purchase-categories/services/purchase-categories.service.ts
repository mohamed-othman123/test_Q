import { HttpClient, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GaConfigService} from '@core/analytics/ga-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {DataTableFilter, GaCustomEvents, TableData} from '@core/models';
import {NotificationService} from '@core/services';
import {ApiConfigService} from '@core/services/api-config.service';
import {PurchaseCategory} from '@purchase-categories/models/purchase-category.model';
import {tap} from 'rxjs';

@Injectable({providedIn: 'root'})
export class PurchaseCategoriesService {
  module = 'purchase-categories';
  apiPurchaseCategoryUrl = this.apiConfigService.getApiBaseUrl(
    this.module as any,
  );

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getAll(filters: DataTableFilter) {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<PurchaseCategory>>(
      this.apiPurchaseCategoryUrl,
      {params},
    );
  }

  create(data: any) {
    return this.http
      .post<PurchaseCategory[]>(this.apiPurchaseCategoryUrl, data)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess(
            'categories.purchaseCategoryAdded',
          );

          this.gtag.event(GaCustomEvents.CREATE_EXPENSE_CATEGORY, {
            organizationInfo: this.gaConfig.getOrganizationInfo(),
            hallInfo: this.gaConfig.getHallInfo(),
          });
        }),
      );
  }

  update(id: any, data: any) {
    return this.http
      .patch<PurchaseCategory[]>(`${this.apiPurchaseCategoryUrl}/${id}`, data)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess(
            'categories.purchaseCategoryUpdated',
          ),
        ),
      );
  }

  delete(id: number) {
    return this.http.delete<PurchaseCategory>(
      `${this.apiPurchaseCategoryUrl}/${id}`,
    );
  }
}

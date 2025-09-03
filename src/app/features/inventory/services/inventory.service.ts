import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GaConfigService} from '@core/analytics/ga-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {DataTableFilter, GaCustomEvents, TableData} from '@core/models';
import {NotificationService} from '@core/services';
import {ApiConfigService} from '@core/services/api-config.service';
import {InventoryItem} from '@inventory/models/inventory';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private module = 'inventory';
  private apiInventoryUrl = this.apiConfigService.getApiBaseUrl(
    this.module as any,
  );

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getInventoryItems(filters: DataTableFilter) {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<InventoryItem>>(this.apiInventoryUrl, {
      params,
    });
  }

  getInventoryItemById(itemId: string) {
    const url = `${this.apiInventoryUrl}/${itemId}`;
    return this.http.get<InventoryItem>(url);
  }

  createInventoryItem(payload: Partial<InventoryItem>) {
    return this.http.post<InventoryItem>(this.apiInventoryUrl, payload).pipe(
      tap(() => {
        this.notificationService.showSuccess(
          'inventory.itemCreatedSuccessfully',
        );

        this.gtag.event(GaCustomEvents.CREATE_INVENTORY_ITEM, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });
      }),
    );
  }

  updateInventoryItem(itemId: string, payload: Partial<InventoryItem>) {
    const url = `${this.apiInventoryUrl}/${itemId}`;
    return this.http.patch<InventoryItem>(url, payload).pipe(
      tap(() => {
        this.notificationService.showSuccess(
          'inventory.itemUpdatedSuccessfully',
        );
      }),
    );
  }

  deleteInventoryItem(itemId: string, hallId?: number, deleteReason?: string) {
    const url = `${this.apiInventoryUrl}/${itemId}`;
    return this.http
      .delete<void>(url, {
        body: {
          hallId,
          reason: deleteReason,
        },
      })
      .pipe(
        tap(() => {
          this.notificationService.showSuccess(
            'inventory.itemDeletedSuccessfully',
          );
        }),
      );
  }
}

import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {TableData, DataTableFilter, GaCustomEvents, Item} from '@core/models';
import {NotificationService} from '@core/services/notification.service';
import {tap} from 'rxjs/operators';
import {PurchaseModel} from '../models/purchase-model';
import {PurchaseCategory} from '@purchase-categories/models/purchase-category.model';
import {ApiConfigService} from '@core/services/api-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {GaConfigService} from '@core/analytics/ga-config.service';
import {
  TYPE_PRODUCT,
  TYPE_SERVICE,
} from '@purchases/constants/purchase.constants';

@Injectable({
  providedIn: 'root',
})
export class PurchasesService {
  private module = 'expenses';
  private apiExpensesUrl = this.apiConfigService.getApiBaseUrl(
    this.module as any,
  );

  currentStep$ = new BehaviorSubject<number>(0);

  currentPurchase$ = new BehaviorSubject<PurchaseModel | null>(null);

  itemTypes = new BehaviorSubject<Item[]>([TYPE_PRODUCT, TYPE_SERVICE]);

  constructor(
    // @Inject(APP_ENVIRONMENT) private environment: Environment,
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getPurchases(
    filters?: DataTableFilter,
  ): Observable<TableData<PurchaseModel>> {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<PurchaseModel>>(this.apiExpensesUrl, {
      params,
    });
  }

  getPurchase(id: number): Observable<PurchaseModel> {
    return this.http.get<PurchaseModel>(`${this.apiExpensesUrl}/${id}`);
  }

  createPurchase(purchase: FormData): Observable<PurchaseModel> {
    return this.http.post<PurchaseModel>(this.apiExpensesUrl, purchase).pipe(
      tap(() => {
        this.notificationService.showSuccess('purchases.purchase_added');

        this.gtag.event(GaCustomEvents.CREATE_EXPENSE, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });
      }),
    );
  }

  updatePurchase(id: number, purchase: FormData): Observable<PurchaseModel> {
    return this.http
      .patch<PurchaseModel>(`${this.apiExpensesUrl}/${id}`, purchase)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('purchases.purchase_updated'),
        ),
      );
  }

  deletePurchase(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiExpensesUrl}/${id}`)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('purchases.purchase_deleted'),
        ),
      );
  }

  getPurchaseCategoriesList(filters: DataTableFilter) {
    const params = new HttpParams({fromObject: filters});
    const url = this.apiConfigService.getApiBaseUrl('purchase-categories');
    return this.http.get<TableData<PurchaseCategory>>(url, {params});
  }
}

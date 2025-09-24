import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DataTableFilter, GaCustomEvents, Item, TableData} from '@core/models';
import {NotificationService} from '@core/services/notification.service';
import {Observable, tap} from 'rxjs';
import {
  Supplier,
  SupplierProduct,
  SupplierRequest,
} from '@suppliers/models/supplier';
import {Service} from '@services/models';
import {ApiConfigService} from '@core/services/api-config.service';
import {PurchaseModel} from '@purchases/models/purchase-model';
import {GtagService} from '@core/analytics/gtag.service';
import {GaConfigService} from '@core/analytics/ga-config.service';

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  module = 'suppliers';
  apiSuppliersUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  private expensesModule = 'expenses';
  private apiExpensesUrl = this.apiConfigService.getApiBaseUrl(
    this.expensesModule as any,
  );

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
    private notificationService: NotificationService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getSuppliers(filters: DataTableFilter = {}): Observable<TableData<Supplier>> {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<Supplier>>(this.apiSuppliersUrl, {
      params,
    });
  }

  getSupplierById(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiSuppliersUrl}/${id}`);
  }

  getSupplierExpenses(
    supplierId: string,
    hallId: number,
    filters: DataTableFilter = {},
  ): Observable<TableData<PurchaseModel>> {
    const expenseFilters = {
      ...filters,
      supplierId: supplierId,
      hallId: hallId.toString(),
    };

    const params = new HttpParams({fromObject: expenseFilters});
    return this.http.get<TableData<PurchaseModel>>(this.apiExpensesUrl, {
      params,
    });
  }

  createSupplier(supplier: SupplierRequest): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiSuppliersUrl, supplier).pipe(
      tap(() => {
        this.notificationService.showSuccess('suppliers.supplier_created');

        this.gtag.event(GaCustomEvents.CREATE_SUPPLIER, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });
      }),
    );
  }

  updateSupplier(
    id: string,
    supplier: Partial<SupplierRequest>,
  ): Observable<Supplier> {
    return this.http
      .patch<Supplier>(`${this.apiSuppliersUrl}/${id}`, supplier)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('suppliers.supplier_updated'),
        ),
      );
  }

  getSupplierFromAnotherHall(id: string, supplier: Partial<SupplierRequest>) {
    return this.http
      .put<Supplier>(`${this.apiSuppliersUrl}/${id}`, supplier)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('suppliers.supplier_created'),
        ),
      );
  }

  deleteSupplier(id: string, hallId: number): Observable<any> {
    return this.http
      .delete(`${this.apiSuppliersUrl}/${id}`, {body: {hallId}})
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('suppliers.supplier_deleted'),
        ),
      );
  }

  getSupplierStatuses(): Observable<Item[]> {
    return this.http.get<Item[]>('assets/lovs/supplier-status.json');
  }

  getSupplierItems(
    item: 'product' | 'service',
    supplierId: string,
    hallId?: number,
  ) {
    const fromObject: any = {itemType: item};
    if (hallId !== undefined) {
      fromObject.hallId = hallId.toString();
    }

    const params = new HttpParams({fromObject});

    const url = `${this.apiSuppliersUrl}/${supplierId}/items`;

    return this.http.get<TableData<Service[] | SupplierProduct[]>>(url, {
      params,
    });
  }

  getEWallets() {
    const url = `${this.apiConfigService.getApiBaseUrl('bank')}/ebanks`;
    return this.http.get<any>(url);
  }

  addSupplierProduct(supplierId: string, product: SupplierProduct) {
    const url = `${this.apiSuppliersUrl}/${supplierId}/products`;
    return this.http.post<SupplierProduct>(url, product).pipe(
      tap(() => {
        this.notificationService.showSuccess(
          'suppliers.supplier_product_added',
        );
      }),
    );
  }

  updateSupplierProduct(supplierId: string, product: SupplierProduct) {
    const url = `${this.apiSuppliersUrl}/${supplierId}/products/${product.id}`;
    return this.http.patch<SupplierProduct>(url, product).pipe(
      tap(() => {
        this.notificationService.showSuccess(
          'suppliers.supplier_product_updated',
        );
      }),
    );
  }

  deleteSupplierProduct(supplierId: string, productId: string) {
    const url = `${this.apiSuppliersUrl}/${supplierId}/products/${productId}`;
    return this.http.delete<any>(url).pipe(
      tap(() => {
        this.notificationService.showSuccess(
          'suppliers.supplier_product_deleted',
        );
      }),
    );
  }
}

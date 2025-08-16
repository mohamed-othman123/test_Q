import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PermissionTypes} from '@auth/models';
import {Filter} from '@core/interfaces';
import {DataTableFilter, FormMode, Item} from '@core/models';
import {AuthService, FilterService} from '@core/services';
import {DrawerService} from '@core/services/drawer.service';
import {PermissionsService} from '@core/services/permissions.service';
import {Hall} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {TranslateService} from '@ngx-translate/core';
import {PurchaseCategory} from '@purchase-categories/models/purchase-category.model';
import {PurchaseCategoriesService} from '@purchase-categories/services/purchase-categories.service';
import {ExpensesType} from '@purchases/constants/purchase.constants';
import {Table} from 'primeng/table';
import {Subject, takeUntil} from 'rxjs';

@Component({
    selector: 'purchase-categories',
    templateUrl: './purchase-categories.component.html',
    styleUrls: ['./purchase-categories.component.scss'],
    standalone: false
})
export class PurchaseCategoriesComponent
  extends Filter
  implements OnInit, OnDestroy
{
  @ViewChild('dt2')
  override dataTable!: Table;

  categories!: PurchaseCategory[];
  currentHall: Hall | null = null;

  expenseType: Item[] = ExpensesType;
  protected override filterConfig: {[key: string]: unknown} = {
    type: [null],
    name: [null],
    description: [null],
  };

  private _unsubscribeAll: Subject<void> = new Subject();

  constructor(
    private readonly purchaseCategoryService: PurchaseCategoriesService,
    public translate: TranslateService,
    protected override filterService: FilterService,
    private drawerService: DrawerService,
    private hallsService: HallsService,
    private authService: AuthService,
    public permissionsService: PermissionsService,
  ) {
    super(filterService);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.hallsService.currentHall$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((hall) => {
        this.currentHall = hall;
        if (hall) {
          this.filterForm.patchValue({hallId: hall.id});
        }
      });
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    if (this.currentHall) {
      const hallFilters = {
        ...filters,
        hallId: this.currentHall.id,
      };

      this.purchaseCategoryService
        .getAll(hallFilters)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response) => {
          this.categories = response.items;
          this.totalRecords = response.totalItems;
        });
    }
  }

  openPurchaseCategoryForm(
    mode: FormMode,
    event?: Event,
    data?: PurchaseCategory,
  ) {
    if (event) event.stopPropagation();

    this.drawerService.open({
      mode,
      title:
        mode === 'add'
          ? 'categories.addNewCategory'
          : 'categories.updateCategory',
      data: mode === 'add' ? {hallId: this.currentHall?.id} : data,
    });
  }

  refreshDataTable(): void {
    this.loadDataTable(this.filters);
  }

  deletePurchaseCategory(data: PurchaseCategory) {
    this.purchaseCategoryService.delete(data.id).subscribe({
      next: (_) => {
        this.loadDataTable(this.filters);
      },
    });
  }

  view(category: PurchaseCategory) {
    this.drawerService.open({
      mode: 'view',
      title: 'events.viewEvent',
      data: category,
    });
  }

  hasPermissionTo(
    action: 'edit' | 'delete' | 'view',
    category: PurchaseCategory,
  ): boolean {
    const user = this.authService.userData?.user;

    const isOwner = category.created_by === user?.userId;

    const canEdit = isOwner || user?.permissionType === PermissionTypes.GENERAL;

    switch (action) {
      case 'edit':
        return (
          this.permissionsService.hasPermission('update:expense category') &&
          canEdit
        );
      case 'delete':
        return (
          this.permissionsService.hasPermission('delete:expense category') &&
          canEdit
        );
      case 'view':
        return this.permissionsService.hasPermission('read:expense categories');
      default:
        return false;
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}

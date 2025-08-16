import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {PermissionTypes} from '@auth/models';
import {Filter} from '@core/interfaces';
import {DataTableFilter, TableData} from '@core/models';
import {AuthService, FilterService, LanguageService} from '@core/services';
import {PermissionsService} from '@core/services/permissions.service';
import {ExpensesItem} from '@expenses-items/models';
import {ExpensesItemsService} from '@expenses-items/services/expenses-items.service';
import {HallsService} from '@halls/services/halls.service';
import {Table} from 'primeng/table';

@Component({
    selector: 'app-expenses-items',
    templateUrl: './expenses-items.component.html',
    styleUrl: './expenses-items.component.scss',
    standalone: false
})
export class ExpensesItemsComponent extends Filter {
  @ViewChild('dt2')
  override dataTable!: Table;

  expensesItems!: ExpensesItem[];

  showDeleteConfirmation = false;
  deletedItemId: string | null = null;

  protected override filterConfig: DataTableFilter = {
    item: [null],
    category: [null],
  };

  constructor(
    protected override filterService: FilterService,
    public lang: LanguageService,
    private router: Router,
    private hallsService: HallsService,
    private expensesItemsService: ExpensesItemsService,
    public permissionService: PermissionsService,
    private auth: AuthService,
  ) {
    super(filterService);
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    const queryFilters = {
      ...filters,
      hallId: this.hallsService.getCurrentHall()?.id,
    };

    const sub = this.expensesItemsService
      .getExpenseItems(queryFilters)
      .subscribe((data: TableData<ExpensesItem>) => {
        this.expensesItems = data.items;
        this.totalRecords = data.totalItems;
      });
  }
  addNewExpenseItem() {
    this.router.navigate(['/expenses-items/add']);
  }

  viewExpenseItem(id: string) {
    this.router.navigate(['/expenses-items/view', id]);
  }

  updateExpenseItem(id: string) {
    this.router.navigate(['/expenses-items/edit', id]);
  }

  hasPermissionTo(
    action: 'read' | 'update' | 'add' | 'delete',
    expensesItems: ExpensesItem,
  ): boolean {
    const isOwner =
      expensesItems.created_by === this.auth.userData?.user.userId;

    const canEdit =
      isOwner ||
      this.auth.userData?.user.permissionType === PermissionTypes.GENERAL;

    switch (action) {
      case 'read':
        return this.permissionService.hasPermission('read:expenseItems');
      case 'update':
        return (
          this.permissionService.hasPermission('update:expenseItem') && canEdit
        );
      case 'add':
        return this.permissionService.hasPermission('create:expenseItem');
      case 'delete':
        return (
          this.permissionService.hasPermission('delete:expenseItem') && canEdit
        );
      default:
        return false;
    }
  }

  openDeleteConfirmation(id: string) {
    this.showDeleteConfirmation = true;
    this.deletedItemId = id;
  }
  rejectDeleteExpenseItem() {
    this.showDeleteConfirmation = false;
    this.deletedItemId = null;
  }
  confirmDeleteExpenseItem() {
    if (this.deletedItemId) {
      this.expensesItemsService
        .deleteExpenseItem(this.deletedItemId)
        .subscribe(() => {
          this.showDeleteConfirmation = false;
          this.deletedItemId = null;
          this.loadDataTable(this.filters);
        });
    }
  }
}

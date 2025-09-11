import {Component, ViewChild} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {PermissionTypes} from '@auth/models';
import {Filter} from '@core/interfaces';
import {DataTableFilter, Item} from '@core/models';
import {AuthService, FilterService, LanguageService} from '@core/services';
import {PermissionsService} from '@core/services/permissions.service';
import {HallsService} from '@halls/services/halls.service';
import {ITEM_STATUS} from '@inventory/constants/inventory';
import {InventoryItem} from '@inventory/models/inventory';
import {InventoryService} from '@inventory/services/inventory.service';
import {stringifyDate} from '@shared/components/date-picker/helper/date-helper';
import moment from 'moment';
import {Table} from 'primeng/table';

@Component({
  selector: 'app-inventory-list',
  standalone: false,
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.scss',
})
export class InventoryListComponent extends Filter {
  @ViewChild('dt2')
  override dataTable!: Table;

  inventoryList: InventoryItem[] = [];

  selectedItemId: string | null = null;

  itemStatus: Item[] = ITEM_STATUS;

  showDeleteReasonPopup = false;
  deleteReason = new FormControl<string>('', {
    validators: Validators.required,
  });

  protected override filterConfig: {[key: string]: unknown} = {
    name: [null],
    unitPrice: [null],
    quantity: [null],
    reorderLevel: [null],
    creationDate: [null],
    updatedDate: [null],
  };

  constructor(
    public permissionsService: PermissionsService,
    protected override filterService: FilterService,
    private authService: AuthService,
    private router: Router,
    private inventoryService: InventoryService,
    private hallsService: HallsService,
    public lang: LanguageService,
  ) {
    super(filterService);
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    filters['hallId'] = this.hallsService.getCurrentHall()?.id;

    const {updatedDate, creationDate, ...restFilters} = filters;
    if (updatedDate) {
      const date = stringifyDate(updatedDate);
      if (!moment(date).isValid()) return;

      restFilters['updatedDate'] = date;
    }

    if (creationDate) {
      const date = stringifyDate(creationDate);
      if (!moment(date).isValid()) return;

      restFilters['creationDate'] = date;
    }

    this.inventoryService.getInventoryItems(restFilters).subscribe({
      next: (res) => {
        this.inventoryList = res.items;
        this.totalRecords = res.totalItems;
      },
    });
  }

  addNewItem() {
    this.router.navigate(['inventory', 'add']);
  }

  editItem(item: InventoryItem) {
    this.router.navigate(['inventory', 'edit', item.id]);
  }

  viewItem(item: InventoryItem) {
    this.router.navigate(['inventory', 'view', item.id]);
  }

  openDeleteConfirmation(id: string) {
    this.selectedItemId = id;
    this.showDeleteReasonPopup = true;
  }

  confirmDeleteItem() {
    if (!this.deleteReason.valid || !this.selectedItemId) {
      this.deleteReason.markAsTouched();
      return;
    }

    const hallId = this.hallsService.getCurrentHall()?.id;
    const deleteReason = this.deleteReason.value;

    this.inventoryService
      .deleteInventoryItem(this.selectedItemId!, hallId, deleteReason!)
      .subscribe(() => {
        this.loadDataTable(this.filters);
        this.selectedItemId = null;
      });
    this.showDeleteReasonPopup = false;
  }

  rejectDeleteItem(): void {
    this.selectedItemId = null;
    this.showDeleteReasonPopup = false;
  }

  hasPermissionTo(action: 'update' | 'delete', item: InventoryItem) {
    const isOwner = item.created_by === this.authService.userData?.user.userId;
    const canEdit =
      isOwner ||
      this.authService.userData?.user.permissionType ===
        PermissionTypes.GENERAL;

    const isActive = item.deleted !== true;

    switch (action) {
      case 'update':
        return (
          canEdit &&
          isActive &&
          this.permissionsService.hasPermission('update:inventory')
        );
      case 'delete':
        return (
          canEdit &&
          isActive &&
          this.permissionsService.hasPermission('delete:inventory')
        );
      default:
        return false;
    }
  }
}

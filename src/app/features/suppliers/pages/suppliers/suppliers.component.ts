import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {SuppliersService} from '../../services/suppliers.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {SortableFields, Supplier} from '@suppliers/models/supplier';
import {Router} from '@angular/router';
import {HallsService} from '@halls/services/halls.service';
import {Hall} from '@halls/models/halls.model';
import {Table} from 'primeng/table';
import {SortEvent} from 'primeng/api';
import {DataTableFilter, Item} from '@core/models';
import {AuthService, FilterService} from '@core/services';
import {Filter} from '@core/interfaces';
import {PermissionsService} from '@core/services/permissions.service';
import {PermissionTypes} from '@auth/models';

@Component({
    selector: 'app-suppliers',
    templateUrl: './suppliers.component.html',
    styleUrl: './suppliers.component.scss',
    standalone: false
})
export class SuppliersComponent extends Filter implements OnInit, OnDestroy {
  @ViewChild('dt')
  override dataTable!: Table;

  suppliers: Supplier[] = [];
  selectedItems: Supplier[] = [];
  loading: boolean = true;
  halls: Hall[] = [];
  private destroy$ = new Subject<void>();
  supplierStatuses: Item[] = [];
  selectedHall: Hall | null = null;
  initialSuppliers: Supplier[] = [];

  showDeleteConfirmation = false;
  selectedSupplierId: null | number = null;

  sortState: Record<SortableFields, 'asc' | 'desc' | null> = {
    name: null,
    activity: null,
  };

  protected override filterConfig: {[key: string]: unknown} = {
    name: [null],
    phone: [null],
    active: [null],
    activity: [null],
    hallId: [this.hallService.getCurrentHall()?.id],
  };

  constructor(
    private suppliersService: SuppliersService,
    public translate: TranslateService,
    private router: Router,
    private hallService: HallsService,
    protected override filterService: FilterService,
    public permissionsService: PermissionsService,
    private authService: AuthService,
  ) {
    super(filterService);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.hallService.halls$
      .pipe(takeUntil(this.destroy$))
      .subscribe((halls) => {
        this.halls = halls;
      });

    this.hallService.currentHall$
      .pipe(takeUntil(this.destroy$))
      .subscribe((hall) => {
        if (hall && hall.id !== this.selectedHall?.id) {
          this.selectedHall = hall;
          this.filterForm.get('hallId')?.setValue(hall.id);
          this.loadDataTable(this.filters);
        }
      });

    this.suppliersService.getSupplierStatuses().subscribe((statuses) => {
      this.supplierStatuses = statuses;
    });
  }

  protected override loadDataTable(filters: DataTableFilter) {
    if (!this.selectedHall) {
      this.suppliers = [];
      this.totalRecords = 0;
      return;
    }

    this.loading = true;
    this.suppliersService
      .getSuppliers({
        ...filters,
        hallId: this.selectedHall.id,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.suppliers = response.items;
        this.initialSuppliers = [...response.items];
        this.totalRecords = response.totalItems;
        this.loading = false;
      });
  }

  loadSuppliers() {
    if (!this.selectedHall) {
      this.suppliers = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    this.suppliersService
      .getSuppliers({hallId: this.selectedHall.id})
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.suppliers = response.items;
        this.initialSuppliers = [...response.items];
        this.loading = false;
      });
  }

  viewSupplier(supplier: Supplier) {
    if (!this.selectedHall) return;
    this.router.navigate(['/suppliers/view', supplier.id], {
      state: {hallId: this.selectedHall.id},
    });
  }

  openDeleteConfirmation(id: number) {
    this.selectedSupplierId = id;
    this.showDeleteConfirmation = true;
  }
  confirmDeleteSupplier() {
    this.deleteSupplier(this.selectedSupplierId!);
    this.selectedSupplierId = null;
    this.showDeleteConfirmation = false;
  }

  rejectDeleteSupplier(): void {
    this.selectedSupplierId = null;
    this.showDeleteConfirmation = false;
  }

  deleteSupplier(id: number) {
    this.suppliersService
      .deleteSupplier(id.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadSuppliers();
      });
  }

  getDeleteMessage(): string {
    return this.translate.instant('common.deleteRecord', {
      deletedItem: this.translate.instant('suppliers.supplier'),
    });
  }

  addNewSupplier() {
    if (!this.selectedHall) return;
    this.router.navigate(['/suppliers/add-new-supplier'], {
      state: {hallId: this.selectedHall.id},
    });
  }

  editSupplier(supplier: Supplier) {
    if (!this.selectedHall) return;
    this.router.navigate(['/suppliers/edit', supplier.id], {
      state: {hallId: this.selectedHall.id},
    });
  }

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasPermissionTo(
    action: 'update' | 'delete' | 'view',
    supplier: Supplier,
  ): boolean {
    const isOwner =
      supplier.created_by === this.authService.userData?.user.userId;
    const canEdit =
      isOwner ||
      this.authService.userData?.user.permissionType ===
        PermissionTypes.GENERAL;

    switch (action) {
      case 'update':
        return (
          canEdit && this.permissionsService.hasPermission('update:suppliers')
        );
      case 'delete':
        return (
          canEdit && this.permissionsService.hasPermission('delete:suppliers')
        );
      case 'view':
        return this.permissionsService.hasPermission('read:suppliers');
      default:
        return false;
    }
  }
}

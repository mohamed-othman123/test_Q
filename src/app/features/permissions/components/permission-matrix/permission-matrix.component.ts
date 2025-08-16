import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import {Permission, PermissionMatrix} from '@auth/models';
import {NotificationService} from '@core/services';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-permission-matrix',
  templateUrl: './permission-matrix.component.html',
  styleUrl: './permission-matrix.component.scss',
  standalone: false,
})
export class PermissionMatrixComponent implements OnInit, OnDestroy {
  @Output() save = new EventEmitter<void>();

  @Input() permissions!: {[k: string]: Permission[]};
  @Input() selectedPermissions!: Set<number>;
  @Input() isViewMode!: boolean;
  @Input() showSaveButton: boolean = true;

  form!: FormGroup;
  permissionMatrix: PermissionMatrix = {};
  modules: {key: string; value: any}[] = [];
  destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.initializePermissionMatrix();
    this.createForm();
    this.modules = Object.entries(this.permissionMatrix).map(
      ([key, value]) => ({
        key,
        value,
      }),
    );
  }

  private initializePermissionMatrix() {
    Object.entries(this.permissions).forEach(([module, routes]) => {
      this.permissionMatrix[module] = {
        read: this.findPermissionByRoute(routes, 'READ'),
        create: this.findPermissionByRoute(routes, 'CREATE'),
        update: this.findPermissionByRoute(routes, 'UPDATE'),
        delete: this.findPermissionByRoute(routes, 'DELETE'),
      };
    });
  }

  private findPermissionByRoute(
    permissions: Permission[],
    type: string,
  ): Permission | null {
    return permissions.find((p) => p.type === type) || null;
  }

  private createForm() {
    const group: {[key: string]: FormControl} = {};

    group['global_all'] = new FormControl(false);
    group['all_read'] = new FormControl(false);
    group['all_create'] = new FormControl(false);
    group['all_update'] = new FormControl(false);
    group['all_delete'] = new FormControl(false);

    Object.entries(this.permissionMatrix).forEach(([module, permissions]) => {
      group[`${module}_all`] = new FormControl(false);

      Object.entries(permissions).forEach(([type, permission]) => {
        const isSelected = permission
          ? this.selectedPermissions.has(permission.id)
          : false;
        const isDisabled = !permission;

        group[`${module}_${type}`] = new FormControl({
          value: isSelected,
          disabled: isDisabled,
        });
      });
    });

    this.form = this.fb.group(group);
    this.updateAllSelectAllControls();

    // this.hookPermissionDependencies();
  }

  // hookPermissionDependencies() {
  //   const dependencyMap = {
  //     Bookings_create: [
  //       'Services',
  //       'Payment Methods',
  //       'Events',
  //       'Clients',
  //       'Payments',
  //     ],
  //     Bookings_update: [
  //       'Services',
  //       'Payment Methods',
  //       'Events',
  //       'Clients',
  //       'Payments',
  //     ],
  //     Expenses_create: [
  //       'Expenses & Suppliers',
  //       'Payment Methods',
  //       'Expenses Items',
  //       'Expense payments',
  //       'Expense Category',
  //     ],
  //     Expenses_update: [
  //       'Expenses & Suppliers',
  //       'Payment Methods',
  //       'Expenses Items',
  //       'Expense payments',
  //       'Expense Category',
  //     ],
  //     'Expense payments_create': ['Payment Methods'],
  //     'Expense payments_update': ['Payment Methods'],
  //     Payments_create: ['Payment Methods'],
  //     Payments_update: ['Payment Methods'],
  //   };

  //   Object.entries(dependencyMap).forEach(([key, deps]) => {
  //     const control = this.form.get(key);
  //     if (!control) return;

  //     control.valueChanges
  //       .pipe(
  //         takeUntil(this.destroy$),
  //         filter((value) => value === true),
  //       )
  //       .subscribe(() => {
  //         this.applyDependencies(deps);
  //       });
  //   });
  // }

  // private applyDependencies(deps: string[]) {
  //   deps.forEach((module) => {
  //     ['read', 'getAll'].forEach((type) => {
  //       const control = this.form.get(`${module}_${type}`);
  //       if (control && !control.value) {
  //         control.setValue(true, {emitEvent: false});
  //       }
  //     });
  //   });
  // }

  toggleGlobalAll() {
    const isSelected = this.form.get('global_all')?.value;
    this.form.get('all_read')?.setValue(isSelected);
    this.form.get('all_create')?.setValue(isSelected);
    this.form.get('all_update')?.setValue(isSelected);
    this.form.get('all_delete')?.setValue(isSelected);

    Object.keys(this.permissionMatrix).forEach((module) => {
      this.form.get(`${module}_all`)?.setValue(isSelected);
      ['create', 'read', 'update', 'delete'].forEach((type) => {
        const control = this.form.get(`${module}_${type}`);
        if (control && !control.disabled) {
          control.setValue(isSelected);
        }
      });
    });
  }

  toggleAllPermissionType(type: string) {
    const isSelected = this.form.get(`all_${type}`)?.value;
    Object.keys(this.permissionMatrix).forEach((module) => {
      const control = this.form.get(`${module}_${type}`);
      if (control && !control.disabled) {
        control.setValue(isSelected);
        this.autoSelectReadPermission(module, type);
      }
      this.updateSelectAll(module);
    });

    this.updateGlobalSelectAll();
  }

  toggleAllModulePermissions(module: string) {
    const isSelected = this.form.get(`${module}_all`)?.value;
    const permissions = this.permissionMatrix[module];

    Object.keys(permissions).forEach((type) => {
      const control = this.form.get(`${module}_${type}`);
      if (control && !control.disabled) {
        control.setValue(isSelected);
      }
    });

    if (!isSelected) {
      this.clearAllDependencies(module);
    }

    this.updatePermissionTypeSelectAll();
    this.updateGlobalSelectAll();
  }

  clearAllDependencies(module: string) {
    const allTypes = ['read', 'create', 'update', 'delete', 'all'];

    const dependencyMap: Record<string, string[]> = {
      'Bookings': ['Booking Discounts', 'Payments'],
      'Expenses': ['Expense payments'],
    };

    const deps = dependencyMap[module];
    if (deps) {
      deps.forEach((dep) => {
        allTypes.forEach((type) => {
          const depControl = this.form.get(`${dep}_${type}`);
          if (depControl && !depControl.disabled) {
            depControl.setValue(false, {emitEvent: false});
          }
        });
      });
    }
  }

  updateSelectAll(module: string) {
    const permissions = this.permissionMatrix[module];

    const allSelected = Object.keys(permissions).every((type) => {
      const control = this.form.get(`${module}_${type}`);
      return control?.disabled || control?.value;
    });

    this.form.get(`${module}_all`)?.setValue(allSelected, {emitEvent: false});
    this.updatePermissionTypeSelectAll();
    this.updateGlobalSelectAll();
  }

  private updatePermissionTypeSelectAll() {
    ['create', 'read', 'update', 'delete'].forEach((type) => {
      const allSelected = Object.keys(this.permissionMatrix).every((module) => {
        const control = this.form.get(`${module}_${type}`);
        return control?.disabled || control?.value;
      });
      this.form.get(`all_${type}`)?.setValue(allSelected, {emitEvent: false});
    });
  }

  private updateGlobalSelectAll() {
    const allSelected = ['create', 'read', 'update', 'delete'].every(
      (type) => this.form.get(`all_${type}`)?.value,
    );
    this.form.get('global_all')?.setValue(allSelected, {emitEvent: false});
  }

  private updateAllSelectAllControls() {
    Object.keys(this.permissionMatrix).forEach((module) => {
      this.updateSelectAll(module);
    });
  }

  public getSelectedPermissionIds(): number[] {
    const selectedIds: number[] = [];
    Object.entries(this.permissionMatrix).forEach(([module, permissions]) => {
      Object.entries(permissions).forEach(([type, permission]) => {
        if (permission && this.form.get(`${module}_${type}`)?.value) {
          selectedIds.push(permission.id);
        }
      });
    });

    return selectedIds;
  }

  autoSelectReadPermission(module: string, type: string) {
    if (!['delete', 'update', 'create'].includes(type)) {
      return;
    }

    const currentControl = this.form.get(`${module}_${type}`);
    if (!currentControl || !currentControl.value) {
      return;
    }

    const readControl = this.form.get(`${module}_read`);

    // if (getAllControl && !getAllControl.value && getAllControl.enabled) {
    //   getAllControl.setValue(true, {emitEvent: false});
    // }

    // if (type === 'read') return;

    if (readControl && !readControl.value && readControl.enabled) {
      readControl.setValue(true, {emitEvent: false});
    }
  }

  checkDependence(module: string, type: string) {
    const currentControl = this.form.get(`${module}_${type}`);

    if (!currentControl) return;

    // if (type === 'getAll') {
    //   const readControl = this.form.get(`${module}_read`);
    //   if (readControl?.value) {
    //     this.warnAndEnable(currentControl);
    //     this.updateSelectAll(module);
    //   }
    //   return;
    // }

    const isDependenceSelected = ['delete', 'update', 'create'].some(
      (type) => this.form.get(`${module}_${type}`)?.value,
    );

    if (isDependenceSelected) {
      this.warnAndEnable(currentControl);
      this.updateSelectAll(module);
      return;
    }

    const allTypes = ['read', 'create', 'update', 'delete'];

    const dependencyMap: Record<string, string[]> = {
      'Bookings_read': ['Booking Discounts', 'Payments'],
      'Expenses_read': ['Expense payments'],
    };

    const key = `${module}_${type}`;
    if (dependencyMap[key]) {
      const deps = dependencyMap[key];
      const hasDependencies = deps.some((dep) => {
        return allTypes.some((t) => {
          const control = this.form.get(`${dep}_${t}`);
          return control && control.value;
        });
      });
      if (hasDependencies) {
        this.warnAndEnable(currentControl);
      }
      return;
    }
  }

  private warnAndEnable(ctrl: AbstractControl) {
    ctrl.setValue(true);
    this.notificationService.showInfo('permissions.dependencyWarning');
  }

  onSave() {
    const selectedIds = this.getSelectedPermissionIds();
    this.selectedPermissions.clear();
    selectedIds.forEach((id) => this.selectedPermissions.add(id));
    this.save.emit();
  }

  shouldShowModule(module: string): boolean {
    switch (module) {
      case 'Booking Discounts':
      case 'Payments':
        return this.form.get('Bookings_read')?.value;
      case 'Expense payments':
        return this.form.get('Expenses_read')?.value;
      default:
        return true;
    }
  }

  isNestedModule(module: string): boolean {
    return ['Booking Discounts', 'Payments', 'Expense payments'].includes(
      module,
    );
  }

  isParentModule(module: string): boolean {
    return ['Bookings', 'Expenses'].includes(module);
  }

  isReadSelected(module: string): boolean {
    return this.form.get(`${module}_read`)?.value || false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

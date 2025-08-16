import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Permission} from '@auth/models';
import {RoleReq} from '@permissions/models';
import {PermissionService} from '@permissions/services/permission.service';
import {Observable, Subscription, tap} from 'rxjs';
import {PermissionMatrixComponent} from '@permissions/components/permission-matrix/permission-matrix.component';
import {EventBusService} from '@core/services/event-bus.service';
import {noDoubleSpaceValidator, requireOneOf} from '@core/validators';

@Component({
    selector: 'app-permission-details',
    templateUrl: './permission-details.component.html',
    styleUrls: ['./permission-details.component.scss'],
    standalone: false
})
export class PermissionDetailsComponent implements OnInit, OnDestroy {
  @ViewChild(PermissionMatrixComponent)
  matrixComponent!: PermissionMatrixComponent;

  mode: 'add' | 'edit' | 'view' = 'add';
  roleId: string | null = null;
  isLoading = false;
  permissions$!: Observable<{[k: string]: Permission[]}>;

  form!: FormGroup;
  // roleName: FormControl;
  // roleNameAr: FormControl;
  // notes: FormControl;
  infoForm = this.fb.group(
    {
      name: this.fb.control<null | string>(null, [noDoubleSpaceValidator()]),
      name_ar: this.fb.control<null | string>(null, [noDoubleSpaceValidator()]),
      notes: this.fb.control<null | string>(null, [noDoubleSpaceValidator()]),
    },
    {
      validators: requireOneOf(['name', 'name_ar']),
    },
  );

  selectedPermissions = new Set<number>();
  subs = new Subscription();

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }

  get isViewMode(): boolean {
    return this.mode === 'view';
  }

  get formControls() {
    return {
      ...this.form.controls,
      ...this.infoForm.controls,
    };
  }

  constructor(
    private fb: FormBuilder,
    private permissionService: PermissionService,
    private route: ActivatedRoute,
    private router: Router,
    private eventBus: EventBusService,
  ) {}

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];
    this.roleId = this.route.snapshot.paramMap.get('id');

    if ((this.isEditMode || this.isViewMode) && this.roleId) {
      this.loadRoleData(this.roleId);
    }

    this.permissions$ = this.permissionService.getPermissions().pipe(
      tap((permissions) => {
        this.form = this.fb.group(this.createPermissionsForm(permissions));
      }),
    );
  }

  loadRoleData(roleId: string): void {
    this.isLoading = true;
    const sub = this.permissionService.getRoleById(roleId).subscribe({
      next: (roleData) => {
        this.infoForm.setValue({
          name: roleData.name,
          name_ar: roleData.name_ar,
          notes: roleData.notes,
        });

        roleData.permissions.forEach((perm) => {
          this.selectedPermissions.add(perm);
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
    this.subs.add(sub);
  }

  createPermissionsForm(permissions: {[k: string]: Permission[]}) {
    const group: any = {};
    Object.keys(permissions).forEach((key) => {
      group[key] = this.fb.array(
        this.createPermissionsControls(permissions[key]),
      );
    });
    return group;
  }

  createPermissionsControls(perms: Permission[]) {
    return perms.map((perm) => {
      return new FormControl(perm);
    });
  }

  submit() {
    if (this.isViewMode) {
      this.router.navigate(['/permissions/edit', this.roleId]);
      return;
    }

    if (this.matrixComponent) {
      const selectedIds = this.matrixComponent.getSelectedPermissionIds();
      this.selectedPermissions.clear();
      selectedIds.forEach((id) => this.selectedPermissions.add(id));
    }

    if (
      this.form.invalid ||
      this.infoForm.invalid ||
      this.selectedPermissions.size === 0
    ) {
      this.form.markAllAsTouched();
      this.infoForm.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.infoForm.updateValueAndValidity();
      return;
    }

    const body: RoleReq = {
      name: this.infoForm.value.name || null,
      name_ar: this.infoForm.value.name_ar || null,
      notes: this.infoForm.value.notes || null,
      permissions: [...this.selectedPermissions],
    };

    if (this.isAddMode) {
      const sub = this.permissionService.createNewRole(body).subscribe({
        next: () => {
          this.navigateToList();
          this.eventBus.announcePermissionsUpdated();
        },
      });
      this.subs.add(sub);
    } else if (this.isEditMode && this.roleId) {
      const sub = this.permissionService
        .updateNewRole(body, this.roleId)
        .subscribe({
          next: () => {
            this.navigateToList();
            this.eventBus.announcePermissionsUpdated();
          },
        });
      this.subs.add(sub);
    }
  }

  cancel() {
    this.navigateToList();
  }

  navigateToList() {
    this.router.navigate(['/permissions']);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

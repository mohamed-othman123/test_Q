import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {PermissionService} from '../../services/permission.service';
import {Role} from '@core/models/role.model';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Filter} from '@core/interfaces';
import {FilterService, LanguageService} from '@core/services';
import {Table} from 'primeng/table';
import {DataTableFilter} from '@core/models';
import {Hall} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';

@Component({
    selector: 'app-permissions',
    templateUrl: './permissions.component.html',
    styleUrl: './permissions.component.scss',
    standalone: false
})
export class PermissionsComponent extends Filter implements OnInit, OnDestroy {
  @ViewChild('dt2')
  override dataTable!: Table;

  permissionsList!: Role[];
  selectedItems!: Role;
  loading: boolean = true;
  currentHall: Hall | null = null;

  protected override filterConfig: {[key: string]: unknown} = {
    name: [null],
    userCount: [null],
    notes: [null],
  };

  constructor(
    private permissionService: PermissionService,
    private translate: TranslateService,
    private router: Router,
    private hallsService: HallsService,
    protected override filterService: FilterService,
    public lang: LanguageService,
  ) {
    super(filterService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    const hallSub = this.hallsService.currentHall$.subscribe((hall) => {
      this.currentHall = hall;
    });
    this.subs.add(hallSub);
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    if (!this.currentHall) return;

    this.loading = true;

    const queryFilters = {
      ...filters,
    };

    const sub = this.permissionService.getRoles(queryFilters).subscribe({
      next: (response) => {
        this.permissionsList = response.items;
        this.totalRecords = response.totalItems;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading purchases:', error);
        this.loading = false;
      },
    });

    this.subs.add(sub);
  }

  loadPermissionsList() {
    const sub = this.permissionService
      .getRoles()
      .subscribe((permissionsList: any) => {
        this.permissionsList = permissionsList.items;
        this.loading = false;
      });
    this.subs.add(sub);
  }

  editRole(role: Role) {
    this.router.navigate(['/permissions/edit', role.id]);
  }

  viewRole(role: Role) {
    this.router.navigate(['/permissions/view', role.id]);
  }

  addNewRole() {
    this.router.navigate(['/permissions/add']);
  }

  confirmDeletePerm(role: Role) {
    this.deleteRole(role);
  }

  deleteRole(role: Role) {
    this.permissionService.deleteClient(role.id).subscribe(() => {
      this.loadPermissionsList();
    });
  }

  getDeleteMessage(role: Role): string {
    const userCount = parseInt(role.userCount);
    if (userCount > 0) {
      return this.translate.instant('permissions.deleteRoleWithUsers', {
        deletedItem: this.translate.instant('permissions.permission'),
        userCount: userCount,
      });
    }
    return this.translate.instant('common.deleteRecord', {
      deletedItem: this.translate.instant('permissions.permission'),
    });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}

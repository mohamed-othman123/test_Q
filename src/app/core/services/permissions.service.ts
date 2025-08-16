import {Injectable} from '@angular/core';
import {Permission, UserData} from '@auth/models';
import {StorageKeys} from '@core/enums';
import {AuthService} from './auth.service';
import {BehaviorSubject} from 'rxjs';
import {EventBusService} from '@core/services/event-bus.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private _permissions: Permission[] = [];
  private _permissionIds: number[] = [];

  private _permissionsChanged = new BehaviorSubject<boolean>(false);
  public permissionsChanged$ = this._permissionsChanged.asObservable();

  constructor(
    private authService: AuthService,
    private eventBus: EventBusService,
  ) {
    this.loadPermissions();

    this.eventBus.permissionsUpdated$.subscribe(() => {
      this.reloadPermissions();
    });

    if (this.authService.user$) {
      this.authService.user$.subscribe((userData) => {
        this.reloadPermissions();
      });
    }
  }

  loadPermissions() {
    try {
      const storageData = this.authService.storage.getItem(
        StorageKeys.USER_DATA,
      );

      if (!storageData) {
        this._permissions = [];
        this._permissionIds = [];
        return;
      }

      const userData = JSON.parse(storageData) as UserData;

      if (userData?.user?.role?.permissions) {
        this._permissions = userData.user.role.permissions;
        this._permissionIds = this._permissions.map((perm) => perm.id);
        this._permissionsChanged.next(true);
      } else {
        this._permissions = [];
        this._permissionIds = [];
      }
    } catch (error) {
      this._permissions = [];
      this._permissionIds = [];
    }
  }

  getPermissionsForModule(moduleName: string): number[] {
    try {
      return this._permissions
        .filter((perm) => perm.en_module === moduleName)
        .map((perm) => perm.id);
    } catch (error) {
      return [];
    }
  }

  hasPermission(permissionName: string): boolean {
    return this._permissions.some((p) => p.en_name === permissionName);
  }

  hasPermissionById(permissionId: number): boolean {
    return this._permissionIds.includes(permissionId);
  }

  hasPermissionByModuleAndType(module: string, type: string): boolean {
    const normalizedType = type.toLowerCase();

    return this._permissions.some((p) => {
      const moduleMatches = p.en_module === module;
      const typeMatches =
        p.type?.toLowerCase() === normalizedType ||
        (p.en_name && p.en_name.split(':')[0].toLowerCase() === normalizedType);

      return moduleMatches && typeMatches;
    });
  }

  getAllPermissions(): Permission[] {
    return [...this._permissions];
  }

  reloadPermissions(): void {
    this.loadPermissions();
    this._permissionsChanged.next(true);
  }
}

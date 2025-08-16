import { HttpClient, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DataTableFilter, GaCustomEvents, TableData} from '@core/models';
import {Role} from '@core/models/role.model';
import {RoleReq, RoleRes} from '@permissions/models';
import {LanguageService} from '@core/services/language.service';
import {NotificationService} from '@core/services/notification.service';
import {map, tap} from 'rxjs';
import {ApiConfigService} from '@core/services/api-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {GaConfigService} from '@core/analytics/ga-config.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  module = 'roles';
  apiRolesUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
    private languageService: LanguageService,
    private notificationService: NotificationService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getRoles(filters?: DataTableFilter) {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<Role>>(this.apiRolesUrl, {params});
  }

  createNewRole(body: RoleReq) {
    return this.http.post(this.apiRolesUrl, body).pipe(
      tap(() => {
        this.notificationService.showSuccess('permissions.role_created'),
          this.gtag.event(GaCustomEvents.CREATE_ROLE, {
            organizationInfo: this.gaConfig.getOrganizationInfo(),
            hallInfo: this.gaConfig.getHallInfo(),
          });
      }),
    );
  }

  updateNewRole(body: RoleReq, roleId: string) {
    const url = `${this.apiRolesUrl}/${roleId}`;
    return this.http
      .patch(url, body)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('permissions.role_updated'),
        ),
      );
  }

  getRoleById(roleId: string) {
    const url = `${this.apiRolesUrl}/${roleId}`;
    return this.http.get<RoleRes>(url);
  }

  getPermissions() {
    const url = this.apiConfigService.getApiBaseUrl('permissions');
    return this.http.get<any>(url).pipe(
      map((permissions) => {
        return permissions.reduce((acc: any, ele: any) => {
          if (!acc[ele.module]) {
            acc[ele.module] = [];
          }
          acc[ele.module].push(ele);
          return acc;
        }, {});
      }),
    );
  }

  deleteClient(roleId: number) {
    const url = `${this.apiRolesUrl}/${roleId}`;
    return this.http
      .delete(url)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('permissions.role_deleted'),
        ),
      );
  }
}

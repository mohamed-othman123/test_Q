import { HttpClient, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';

import {DataTableFilter, GaCustomEvents, Item, TableData} from '@core/models';
import {Role} from '@core/models/role.model';
import {Moderator} from '@employees/models/employee.model';
import {Observable, tap} from 'rxjs';
import {NotificationService} from '@core/services/notification.service';
import {ApiConfigService} from '@core/services/api-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {GaConfigService} from '@core/analytics/ga-config.service';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  module = 'users';
  apiUsersUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private apiConfigService: ApiConfigService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getListModerators(
    filters?: DataTableFilter,
  ): Observable<TableData<Moderator>> {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<Moderator>>(
      `${this.apiUsersUrl}/moderators`,
      {
        params,
      },
    );
  }

  addModerator(moderatorData: any): Observable<Moderator> {
    const payload = {
      ...moderatorData,
      halls: moderatorData.halls || [], // Use the halls array directly
    };

    return this.http
      .post<Moderator>(`${this.apiUsersUrl}/moderators`, payload)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('employees.employee_added');

          this.gtag.event(GaCustomEvents.CREATE_EMPLOYEE, {
            organizationInfo: this.gaConfig.getOrganizationInfo(),
            hallInfo: this.gaConfig.getHallInfo(),
          });
        }),
      );
  }

  updateModerator(id: number, moderatorData: any): Observable<any> {
    const payload = {
      ...moderatorData,
      halls: moderatorData.halls || [], // Use the halls array directly
    };

    return this.http
      .patch<any>(`${this.apiUsersUrl}/moderators/${id}`, payload)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('employees.employee_updated'),
        ),
      );
  }

  getRoles(): Observable<Role[]> {
    const url = this.apiConfigService.getApiBaseUrl('roles');
    return this.http.get<Role[]>(url);
  }

  deleteEmployee(id: number | undefined) {
    return this.http
      .delete(`${this.apiUsersUrl}/moderators/${id}`)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('employees.employee_deleted'),
        ),
      );
  }

  getEmployeeStatuses(): Observable<Item[]> {
    return this.http.get<Item[]>('assets/lovs/employee-status.json');
  }
}

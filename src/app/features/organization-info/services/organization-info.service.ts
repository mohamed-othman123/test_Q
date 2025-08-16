import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {NotificationService} from '@core/services';
import {ApiConfigService} from '@core/services/api-config.service';
import {OrganizationInfo} from '@organization-info/model/organization-info';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrganizationInfoService {
  module = 'clients';
  apiClientsUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
  ) {}

  getOrganizationInfo() {
    const url = `${this.apiClientsUrl}/organization`;
    return this.http.get<OrganizationInfo>(url);
  }

  updateOrganizationInfo(payload: OrganizationInfo) {
    const url = `${this.apiClientsUrl}/organization`;
    return this.http
      .patch<OrganizationInfo>(url, payload)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('organizationInfo.updated'),
        ),
      );
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DataTableFilter, GaCustomEvents, TableData} from '@core/models';
import {Hall} from '@halls/models/halls.model';
import {Service} from '@services/models';
import {tap} from 'rxjs';
import {NotificationService} from '@core/services/notification.service';
import {ApiConfigService} from '@core/services/api-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {GaConfigService} from '@core/analytics/ga-config.service';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  module = 'services';
  apiServicesUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
    private notificationService: NotificationService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getServices(filters?: DataTableFilter) {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<Service>>(this.apiServicesUrl, {params});
  }

  getHalls() {
    const url = this.apiConfigService.getApiBaseUrl('halls');
    return this.http.get<TableData<Hall>>(url);
  }

  addNewService(payload: Partial<Service>) {
    return this.http.post(this.apiServicesUrl, payload).pipe(
      tap(() => {
        this.notificationService.showSuccess('services.service_added');

        this.gtag.event(GaCustomEvents.CREATE_SERVICE, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });
      }),
    );
  }

  getServiceById(serviceId: number) {
    const url = `${this.apiServicesUrl}/${serviceId}`;
    return this.http.get<Service>(url);
  }

  updateService(serviceId: number, payload: any) {
    const url = `${this.apiServicesUrl}/${serviceId}`;
    return this.http
      .patch(url, payload)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('services.service_updated'),
        ),
      );
  }

  deleteService(serviceId: number) {
    const url = `${this.apiServicesUrl}/${serviceId}`;
    return this.http
      .delete(url)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('services.service_deleted'),
        ),
      );
  }
}

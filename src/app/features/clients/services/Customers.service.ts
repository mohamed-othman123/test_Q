import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DataTableFilter, GaCustomEvents, Item, TableData} from '@core/models';
import {Client} from '@clients/models/client.model';
import {NotificationService} from '@core/services/notification.service';
import {Observable, tap} from 'rxjs';
import {ApiConfigService} from '@core/services/api-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {GaConfigService} from '@core/analytics/ga-config.service';

@Injectable({providedIn: 'root'})
export class CustomersService {
  module = 'halls-clients';
  apiHallsClientsUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
    private notificationService: NotificationService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getClients(filters?: DataTableFilter) {
    const url = `${this.apiHallsClientsUrl}`;
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<Client>>(url, {params});
  }

  createNewClient(payload: Partial<Client>) {
    const url = `${this.apiHallsClientsUrl}`;
    return this.http.post<Client>(url, payload).pipe(
      tap(() => {
        this.notificationService.showSuccess('clients.client_added');

        this.gtag.event(GaCustomEvents.CREATE_CLIENT, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });
      }),
    );
  }

  updateClient(clientId: number, payload: Partial<Client>) {
    const url = `${this.apiHallsClientsUrl}/${clientId}`;
    return this.http
      .patch<Client>(url, payload)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('clients.client_updated'),
        ),
      );
  }

  getClientFromAnotherHall(clientId: number, payload: Partial<Client>) {
    const url = `${this.apiHallsClientsUrl}/${clientId}`;
    return this.http
      .put<Client>(url, payload)
      .pipe(
        tap(() => this.notificationService.showSuccess('clients.client_added')),
      );
  }

  deleteClient(clientId: number, hallId: number) {
    const url = `${this.apiHallsClientsUrl}/${clientId}`;
    return this.http
      .delete<Client>(url, {body: {hallId}})
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('clients.client_deleted'),
        ),
      );
  }

  getClientTypes(): Observable<Item[]> {
    return this.http.get<Item[]>('assets/lovs/clients.json');
  }

  getClientById(clientId: number) {
    const url = `${this.apiHallsClientsUrl}/${clientId}`;
    return this.http.get<Client>(url);
  }
}

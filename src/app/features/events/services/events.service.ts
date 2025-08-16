import { HttpClient, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GaConfigService} from '@core/analytics/ga-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {DataTableFilter, GaCustomEvents, TableData} from '@core/models';
import {ApiConfigService} from '@core/services/api-config.service';
import {NotificationService} from '@core/services/notification.service';
import {Event} from '@events/models/events.model';
import {Observable, tap} from 'rxjs';

@Injectable({providedIn: 'root'})
export class EventsService {
  module = 'events';
  apiEventsUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getListEvents(filters?: DataTableFilter): Observable<TableData<Event>> {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<Event>>(`${this.apiEventsUrl}`, {params});
  }

  addEvent(event: any): Observable<Event> {
    return this.http.post<Event>(`${this.apiEventsUrl}`, event).pipe(
      tap(() => {
        this.notificationService.showSuccess('events.event_added');

        this.gtag.event(GaCustomEvents.CREATE_EVENT, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });
      }),
    );
  }

  updateEvent(id: number, event: any): Observable<Event> {
    return this.http
      .patch<Event>(`${this.apiEventsUrl}/${id}`, event)
      .pipe(
        tap(() => this.notificationService.showSuccess('events.event_updated')),
      );
  }

  deleteEvent(id: number) {
    return this.http
      .delete(`${this.apiEventsUrl}/${id}`)
      .pipe(
        tap(() => this.notificationService.showSuccess('events.event_deleted')),
      );
  }
}

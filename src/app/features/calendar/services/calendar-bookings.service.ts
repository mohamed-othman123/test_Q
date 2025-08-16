import {Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable} from 'rxjs';
import {Inject} from '@angular/core';
import {HallsService} from '@halls/services/halls.service';
import {APP_ENVIRONMENT} from '@core/constants';
import {Environment} from '@core/models';
import {ApiConfigService} from '@core/services/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class CalendarBookingsService {
  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
    private hallsService: HallsService,
  ) {}

  getCalendarBookings(params: {
    year: number;
    month: number;
  }): Observable<any[]> {
    const url = `${this.apiConfigService.getApiBaseUrl('booking')}/calendar`;
    const currentHall = this.hallsService.getCurrentHall();

    if (!currentHall) {
      return new Observable((subscriber) => {
        subscriber.next([]);
        subscriber.complete();
      });
    }

    let httpParams = new HttpParams()
      .set('hallId', currentHall.id.toString())
      .set('year', params.year.toString())
      .set('month', params.month.toString());

    return this.http.get<any>(url, {params: httpParams});
  }
}

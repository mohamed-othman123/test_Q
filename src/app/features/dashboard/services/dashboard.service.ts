import { HttpClient, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DataTableFilter, TableData} from '@core/models';
import {ApiConfigService} from '@core/services/api-config.service';
import {
  KeyMetrics,
  ChartData,
  UpcomingBooking,
  ReservedBookings,
  DashboardPayment,
} from '@dashboard/models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  module = 'statistics';
  apiStatisticsUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private http: HttpClient,
    // @Inject(APP_ENVIRONMENT) private environment: Environment,
    private apiConfigService: ApiConfigService,
  ) {}

  getDashboardKeyMetrics(
    hallId: string,
    months?: string,
    fromDate?: string,
    toDate?: string,
  ) {
    const queryParams = new URLSearchParams({hallId});

    if (months) {
      queryParams.append('months', months);
    }
    if (fromDate && toDate) {
      queryParams.append('fromDate', fromDate);
      queryParams.append('toDate', toDate);
    }

    let url = `${this.apiStatisticsUrl}?${queryParams.toString()}`;

    return this.http.get<KeyMetrics>(url);
  }

  getDashboardChartData(
    hallId: string,
    months?: string,
    fromDate?: string,
    toDate?: string,
    type: 'week' | 'month' = 'week',
  ) {
    const queryParams = new URLSearchParams({hallId});

    if (months) {
      queryParams.append('months', months);
    }
    if (fromDate && toDate) {
      queryParams.append('fromDate', fromDate);
      queryParams.append('toDate', toDate);
    }
    queryParams.append('type', type);

    let url = `${this.apiStatisticsUrl}/chart?${queryParams.toString()}`;
    return this.http.get<ChartData[]>(url);
  }

  getUpcomingBooking(hallId: number) {
    const url = `${this.apiStatisticsUrl}/next-booking?hallId=${hallId}`;
    return this.http.get<UpcomingBooking[]>(url);
  }

  getReservedBookings(hallId: number, year: number, month: number) {
    const url = `${this.apiStatisticsUrl}/calender-booked?hallId=${hallId}&year=${year}&month=${month}`;
    return this.http.get<ReservedBookings[]>(url);
  }

  getDashboardPayments(filters?: DataTableFilter) {
    const url = `${this.apiStatisticsUrl}/payments`;
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<DashboardPayment>>(url, {params});
  }
}

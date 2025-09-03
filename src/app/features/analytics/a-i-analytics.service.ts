import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '@core/services/api-config.service';

export interface Dashboard {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardUrl {
  url: string;
  expiresAt: string;
}

export interface Question {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionUrl {
  url: string;
  expiresAt: string;
}

export interface Database {
  id: number;
  name: string;
  engine: string;
  created_at: string;
}

export interface AIChatRequest {
  message: string;
  hallIds: number[];
}

export interface AIChatResponse {
  explanation: string;
  url: string;
}

export interface Hall {
  id: number;
  name: string;
}

export enum DashboardTypes {
  Booking = 'Bookings',
  Expense = 'Expenses',
}

export interface DashboardFilters {
  // Common filters
  dashboardType?: DashboardTypes;
  months?: number;
  fromDate?: string;
  toDate?: string;

  // Booking filters
  eventTypeId?: number;
  eventTime?: string;
  bookingProcessStatus?: string;
  attendeesType?: string;
  clientType?: string;

  // Expense filters
  expenseStatus?: string;
  expenseType?: string;
  expenseCategory?: number;
  expenseItem?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AIAnalyticsService {
  private module = 'analytics';
  private apiAnalyticsUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
  ) {}

  getAvailableDashboards(): Observable<Dashboard[]> {
    const url = `${this.apiAnalyticsUrl}/available-dashboards`;
    return this.http.get<Dashboard[]>(url);
  }

  getDashboardUrl(
    dashboardId: number,
    hallIds: number[],
    filters?: DashboardFilters
  ): Observable<DashboardUrl> {
    const url = `${this.apiAnalyticsUrl}/dashboard-url`;
    let params = new HttpParams()
      .set('dashboardId', dashboardId.toString())
      .set('dashboardType', filters?.dashboardType || DashboardTypes.Booking);

    hallIds.forEach(hallId => {
      params = params.append('hallIds', hallId.toString());
    });

    if (filters?.months) {
      params = params.set('months', filters.months.toString());
    }
    if (filters?.fromDate) {
      params = params.set('fromDate', filters.fromDate);
    }
    if (filters?.toDate) {
      params = params.set('toDate', filters.toDate);
    }

    if (filters?.eventTypeId) {
      params = params.set('eventTypeId', filters.eventTypeId.toString());
    }
    if (filters?.eventTime) {
      params = params.set('eventTime', filters.eventTime);
    }
    if (filters?.bookingProcessStatus) {
      params = params.set('bookingProcessStatus', filters.bookingProcessStatus);
    }
    if (filters?.attendeesType) {
      params = params.set('attendeesType', filters.attendeesType);
    }
    if (filters?.clientType) {
      params = params.set('clientType', filters.clientType);
    }

    if (filters?.expenseStatus) {
      params = params.set('expenseStatus', filters.expenseStatus);
    }
    if (filters?.expenseType) {
      params = params.set('expenseType', filters.expenseType);
    }
    if (filters?.expenseCategory) {
      params = params.set('expenseCategory', filters.expenseCategory.toString());
    }
    if (filters?.expenseItem) {
      params = params.set('expenseItem', filters.expenseItem.toString());
    }

    return this.http.get<DashboardUrl>(url, { params });
  }

  getAvailableQuestions(): Observable<Question[]> {
    const url = `${this.apiAnalyticsUrl}/available-questions`;
    return this.http.get<Question[]>(url);
  }

  getQuestionUrl(
    questionId: number,
    hallIds: number[],
    parameters?: any
  ): Observable<QuestionUrl> {
    const url = `${this.apiAnalyticsUrl}/question-url`;
    let params = new HttpParams().set('questionId', questionId.toString());

    hallIds.forEach(hallId => {
      params = params.append('hallIds', hallId.toString());
    });

    if (parameters) {
      params = params.set('parameters', JSON.stringify(parameters));
    }

    return this.http.get<QuestionUrl>(url, { params });
  }

  getDatabases(): Observable<Database[]> {
    const url = `${this.apiAnalyticsUrl}/databases`;
    return this.http.get<Database[]>(url);
  }
}

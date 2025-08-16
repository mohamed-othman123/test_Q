import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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

@Injectable({
  providedIn: 'root',
})
export class AIAnalyticsService {
  private module = 'analytics';
  private apiAnalyticsUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
  ) {
  }

  getAvailableDashboards(): Observable<Dashboard[]> {
    const url = `${this.apiAnalyticsUrl}/available-dashboards`;

    return this.http.get<Dashboard[]>(url).pipe();
  }

  getDashboardUrl(dashboardId: number, parameters?: any): Observable<DashboardUrl> {
    const url = `${this.apiAnalyticsUrl}/dashboard-url`;
    let params = new HttpParams().set('dashboardId', dashboardId.toString());

    if (parameters) {
      params = params.set('parameters', JSON.stringify(parameters));
    }


    return this.http.get<DashboardUrl>(url, { params }).pipe(
      tap((response) => {
      })
    );
  }

  getAvailableQuestions(): Observable<Question[]> {
    const url = `${this.apiAnalyticsUrl}/available-questions`;

    return this.http.get<Question[]>(url).pipe(
      tap((response) => {
      })
    );
  }

  getQuestionUrl(questionId: number, parameters?: any): Observable<QuestionUrl> {
    const url = `${this.apiAnalyticsUrl}/question-url`;
    let params = new HttpParams().set('questionId', questionId.toString());

    if (parameters) {
      params = params.set('parameters', JSON.stringify(parameters));
    }


    return this.http.get<QuestionUrl>(url, { params }).pipe(
      tap((response) => {
      })
    );
  }

  getDatabases(): Observable<Database[]> {
    const url = `${this.apiAnalyticsUrl}/databases`;

    return this.http.get<Database[]>(url).pipe(
      tap((response) => {
      })
    );
  }
}

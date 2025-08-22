import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

export interface AIChatMessage {
  id: string;
  message: string;
  hallIds: number[];
  timestamp: Date;
  type: 'user' | 'assistant';
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
    parameters?: any
  ): Observable<DashboardUrl> {
    const url = `${this.apiAnalyticsUrl}/dashboard-url`;
    let params = new HttpParams().set('dashboardId', dashboardId.toString());

    hallIds.forEach(hallId => {
      params = params.append('hallIds', hallId.toString());
    });

    if (parameters) {
      params = params.set('parameters', JSON.stringify(parameters));
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

  sendAIChatMessage(request: AIChatRequest): Observable<AIChatResponse> {
    const url = `${this.apiAnalyticsUrl}/ai-chat`;

    const headers = new HttpHeaders({
      'X-Skip-Global-Loader': 'true'
    });

    return this.http.post<AIChatResponse>(url, request, { headers });
  }

  getDatabases(): Observable<Database[]> {
    const url = `${this.apiAnalyticsUrl}/databases`;
    return this.http.get<Database[]>(url);
  }
}

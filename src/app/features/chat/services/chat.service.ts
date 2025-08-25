import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AIChatRequest, AIChatResponse } from '../models/chat.types';
import { ApiConfigService } from '@core/services/api-config.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private module = 'analytics';
  private apiAnalyticsUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
  ) {}

  sendMessage(request: AIChatRequest): Observable<AIChatResponse> {
    const url = `${this.apiAnalyticsUrl}/ai-chat`;

    const headers = new HttpHeaders({
      'X-Skip-Global-Loader': 'true'
    });

    return this.http.post<AIChatResponse>(url, request, { headers });
  }
}

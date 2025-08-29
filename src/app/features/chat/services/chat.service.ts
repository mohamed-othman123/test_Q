import { Injectable, signal, computed, resource, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ApiConfigService } from '@core/services/api-config.service';
import {
  AIChatRequest,
  ApiMessage,
  ChatDisplayMessage,
  Conversation,
  ConversationResponse,
  EnhancedAIChatResponse,
  MessagesResponse,
} from '../models/chat.types';

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private http = inject(HttpClient);
  private apiConfigService = inject(ApiConfigService);
  private baseUrl = this.apiConfigService.getApiBaseUrl('ai-agent');

  private conversationFilters = signal<{
    page: number;
    limit: number;
    hallId?: number;
  }>({ page: 1, limit: 20 });

  private messageFilters = signal<{
    conversationId: number;
    page: number;
    limit: number;
  } | null>(null);

  private conversationsLoading = signal(false);
  private messagesLoading = signal(false);

  conversationsResource = resource({
    loader: async ({ abortSignal }) => {
      this.conversationsLoading.set(true);
      const filters = this.conversationFilters();

      try {
        if (!filters.hallId) {
          console.warn('hallId is required for conversations endpoint');
          return [];
        }

        const params = {
          page: filters.page.toString(),
          limit: filters.limit.toString(),
          hallId: filters.hallId.toString()
        };

        const response = await this.http.get<ConversationResponse>(`${this.baseUrl}/conversations`, {
          params,
          headers: { 'X-Skip-Global-Loader': 'true' }
        }).toPromise();

        console.log('Conversations API Response:', response);

        if (response?.data?.items && Array.isArray(response.data.items)) {
          console.log(`Found ${response.data.items.length} conversations`);
          return response.data.items;
        }

        console.log('No conversations found in response');
        return [];

      } catch (error) {
        console.error('Error loading conversations:', error);
        return [];
      } finally {
        this.conversationsLoading.set(false);
      }
    }
  });

  messagesResource = resource({
    loader: async ({ abortSignal }) => {
      const messageFilters = this.messageFilters();
      if (!messageFilters) return [];

      this.messagesLoading.set(true);

      try {
        const params = {
          page: messageFilters.page.toString(),
          limit: messageFilters.limit.toString()
        };

        const response = await this.http.get<MessagesResponse>(
          `${this.baseUrl}/conversations/${messageFilters.conversationId}/messages`,
          {
            params,
            headers: { 'X-Skip-Global-Loader': 'true' }
          }
        ).toPromise();

        console.log('Messages API Response:', response);

        if (response?.data?.items && Array.isArray(response.data.items)) {
          return this.transformApiMessages(response.data.items);
        }

        return [];
      } catch (error) {
        console.error('Error loading messages:', error);
        return [];
      } finally {
        this.messagesLoading.set(false);
      }
    }
  });

  conversations = computed(() => {
    try {
      const value = this.conversationsResource.value();
      return Array.isArray(value) ? value : [];
    } catch (error) {
      console.warn('Error accessing conversations resource:', error);
      return [];
    }
  });

  messages = computed(() => {
    try {
      const value = this.messagesResource.value();
      return Array.isArray(value) ? value : [];
    } catch (error) {
      console.warn('Error accessing messages resource:', error);
      return [];
    }
  });

  isLoadingConversations = computed(() => this.conversationsLoading());
  isLoadingMessages = computed(() => this.messagesLoading());

  getConversations(page: number = 1, limit: number = 20, hallId?: number): Observable<Conversation[]> {
    this.conversationFilters.set({ page, limit, hallId });
    return this.createObservableFromResource(this.conversationsResource);
  }

  getMessages(conversationId: number, page: number = 1, limit: number = 50): Observable<ChatDisplayMessage[]> {
    this.messageFilters.set({ conversationId, page, limit });
    return this.createObservableFromResource(this.messagesResource);
  }

  sendMessageStreaming(request: AIChatRequest): Observable<EnhancedAIChatResponse> {
    const url = `${this.baseUrl}/chat`;
    const headers = new HttpHeaders({
      'X-Skip-Global-Loader': 'true',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });

    const payload = request.conversationId
      ? {
        message: request.message,
        conversationId: request.conversationId,
        hallIds: request.hallIds
      }
      : {
        message: request.message,
        hallIds: request.hallIds
      };

    return this.http.post<EnhancedAIChatResponse>(url, payload, { headers }).pipe(
      map(response => ({
        ...response,
        streamUrl: response.streamUrl || this.createMockStreamUrl()
      })),
      catchError(this.handleError)
    );
  }

  loadConversations(hallId?: number): void {
    this.conversationFilters.update(current => ({
      ...current,
      hallId
    }));
    this.conversationsResource.reload();
  }

  loadMessages(conversationId: number): void {
    this.messageFilters.set({
      conversationId,
      page: 1,
      limit: 50
    });
    this.messagesResource.reload();
  }

  refreshConversations(): void {
    this.conversationsResource.reload();
  }

  refreshMessages(): void {
    this.messagesResource.reload();
  }

  private createObservableFromResource<T>(resource: any): Observable<T> {
    return new Observable(subscriber => {
      const value = resource.value();
      const error = resource.error();

      if (error) {
        subscriber.error(error);
      } else if (value !== undefined) {
        subscriber.next(value);
        subscriber.complete();
      } else {
        const checkForValue = () => {
          const newValue = resource.value();
          const newError = resource.error();

          if (newError) {
            subscriber.error(newError);
          } else if (newValue !== undefined) {
            subscriber.next(newValue);
            subscriber.complete();
          } else {
            setTimeout(checkForValue, 100);
          }
        };
        checkForValue();
      }
    });
  }

  private createMockStreamUrl(): string {
    return `${this.baseUrl}/stream/${Date.now()}`;
  }

  private transformApiMessages(apiMessages: ApiMessage[]): ChatDisplayMessage[] {
    const displayMessages: ChatDisplayMessage[] = [];

    apiMessages.forEach(apiMsg => {
      if (apiMsg.user?.trim()) {
        displayMessages.push({
          id: `user_${apiMsg.id}`,
          message: apiMsg.user,
          hallIds: [],
          timestamp: new Date(apiMsg.created_at),
          type: 'user',
          status: 'delivered'
        });
      }

      if (apiMsg.assistant?.trim()) {
        displayMessages.push({
          id: `assistant_${apiMsg.id}`,
          message: apiMsg.assistant,
          hallIds: [],
          timestamp: new Date(apiMsg.updated_at),
          type: 'assistant',
          status: 'delivered'
        });
      }
    });

    return displayMessages.sort((a, b) =>
      a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('AI Chat Service Error:', error);

    let userFriendlyMessage = 'An unexpected error occurred';

    if (error.status === 0) {
      userFriendlyMessage = 'Unable to connect to the AI service.';
    } else if (error.status === 404) {
      userFriendlyMessage = 'The requested resource was not found.';
    } else if (error.status >= 500) {
      userFriendlyMessage = 'The AI service is temporarily unavailable.';
    } else if (error.error?.message) {
      userFriendlyMessage = error.error.message;
    }

    return throwError(() => new Error(userFriendlyMessage));
  };
}

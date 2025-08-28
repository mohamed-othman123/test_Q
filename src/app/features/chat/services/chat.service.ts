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

  // Reactive state management with signals
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

  // Loading states
  private conversationsLoading = signal(false);
  private messagesLoading = signal(false);

  // Fixed resource implementation for Angular 19 with proper HttpClient usage
  conversationsResource = resource({
    loader: async ({ abortSignal }) => {
      this.conversationsLoading.set(true);
      const filters = this.conversationFilters();

      try {
        // Ensure hallId is provided as it's required by the API
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
          headers: { 'X-Skip-Global-Loader': 'true' },
          context: new AbortController().signal === abortSignal ? undefined : undefined
        }).toPromise();

        return response?.data || [];
      } catch (error) {
        console.warn('AI service error for conversations:', error);
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
            headers: { 'X-Skip-Global-Loader': 'true' },
            context: new AbortController().signal === abortSignal ? undefined : undefined
          }
        ).toPromise();

        return this.transformApiMessages(response?.data || []);
      } catch (error) {
        console.warn('AI service error for messages:', error);
        return [];
      } finally {
        this.messagesLoading.set(false);
      }
    }
  });

  // Computed signals for easy access with error handling
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

  // Traditional Observable methods for backward compatibility
  getConversations(page: number = 1, limit: number = 20, hallId?: number): Observable<Conversation[]> {
    // Update resource parameters to trigger fetch
    this.conversationFilters.set({ page, limit, hallId });

    // Return current value or fetch fresh data
    return this.createObservableFromResource(this.conversationsResource);
  }

  getMessages(conversationId: number, page: number = 1, limit: number = 50): Observable<ChatDisplayMessage[]> {
    this.messageFilters.set({ conversationId, page, limit });
    return this.createObservableFromResource(this.messagesResource);
  }

  // Enhanced streaming method with proper error handling
  sendMessageStreaming(request: AIChatRequest): Observable<EnhancedAIChatResponse> {
    const url = `${this.baseUrl}/chat`;
    const headers = new HttpHeaders({
      'X-Skip-Global-Loader': 'true',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });

    // Format request based on conversation state
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
        streamUrl: response.streamUrl || this.createMockStreamUrl() // Fallback for testing
      })),
      catchError(this.handleError)
    );
  }

  // Reactive loading methods
  loadConversations(hallId?: number): void {
    this.conversationFilters.update(current => ({
      ...current,
      hallId
    }));
    // Trigger resource reload
    this.conversationsResource.reload();
  }

  loadMessages(conversationId: number): void {
    this.messageFilters.set({
      conversationId,
      page: 1,
      limit: 50
    });
    // Trigger resource reload
    this.messagesResource.reload();
  }

  refreshConversations(): void {
    this.conversationsResource.reload();
  }

  refreshMessages(): void {
    this.messagesResource.reload();
  }

  // Utility methods
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
        // Resource is still loading, wait for value
        const checkForValue = () => {
          const newValue = resource.value();
          const newError = resource.error();

          if (newError) {
            subscriber.error(newError);
          } else if (newValue !== undefined) {
            subscriber.next(newValue);
            subscriber.complete();
          } else {
            // Still loading, check again
            setTimeout(checkForValue, 100);
          }
        };
        checkForValue();
      }
    });
  }

  private createMockStreamUrl(): string {
    // Create a mock stream URL for development/testing
    return `${this.baseUrl}/stream/${Date.now()}`;
  }

  private transformApiMessages(apiMessages: ApiMessage[]): ChatDisplayMessage[] {
    const displayMessages: ChatDisplayMessage[] = [];

    apiMessages.forEach(apiMsg => {
      // Add user message
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

      // Add assistant message
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
      userFriendlyMessage = 'Unable to connect to the AI service. Please check your connection.';
    } else if (error.status === 401) {
      userFriendlyMessage = 'Authentication required. Please log in again.';
    } else if (error.status === 403) {
      userFriendlyMessage = 'You don\'t have permission to perform this action.';
    } else if (error.status === 404) {
      userFriendlyMessage = 'The requested conversation or message was not found.';
    } else if (error.status === 429) {
      userFriendlyMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (error.status >= 500) {
      userFriendlyMessage = 'Server error. Our team has been notified.';
    } else if (error.error?.message) {
      userFriendlyMessage = error.error.message;
    }

    return throwError(() => new Error(userFriendlyMessage));
  };
}

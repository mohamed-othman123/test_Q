import { Injectable, signal, computed, resource, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError, BehaviorSubject } from 'rxjs';
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
  private baseUrl = 'http://localhost:3001/ai-agent';

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

  // Fixed resource implementation for Angular 19
  conversationsResource = resource({
    loader: async ({ abortSignal }) => {
      this.conversationsLoading.set(true);
      const filters = this.conversationFilters();

      try {
        let url = `${this.baseUrl}/conversations?page=${filters.page}&limit=${filters.limit}`;
        if (filters.hallId) {
          url += `&hallId=${filters.hallId}`;
        }

        const response = await fetch(url, {
          signal: abortSignal,
          headers: {
            'Content-Type': 'application/json',
            'X-Skip-Global-Loader': 'true'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ConversationResponse = await response.json();
        return data.data || [];
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
        const url = `${this.baseUrl}/conversations/${messageFilters.conversationId}/messages?page=${messageFilters.page}&limit=${messageFilters.limit}`;

        const response = await fetch(url, {
          signal: abortSignal,
          headers: {
            'Content-Type': 'application/json',
            'X-Skip-Global-Loader': 'true'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: MessagesResponse = await response.json();
        return this.transformApiMessages(data.data || []);
      } finally {
        this.messagesLoading.set(false);
      }
    }
  });

  // Computed signals for easy access
  conversations = computed(() => {
    const value = this.conversationsResource.value();
    return Array.isArray(value) ? value : [];
  });

  messages = computed(() => {
    const value = this.messagesResource.value();
    return Array.isArray(value) ? value : [];
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

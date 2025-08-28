import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectorRef,
  OnDestroy,
  signal,
  computed,
  effect,
  inject,
  Injector,
  runInInjectionContext
} from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize, fromEvent, debounceTime } from 'rxjs';

import { HallsService } from '@halls/services/halls.service';
import { NotificationService } from '@core/services/notification.service'; // Add if available

import {
  AIChatRequest,
  Hall,
  ChatDisplayMessage,
  Conversation,
  EnhancedAIChatResponse,
  MessageStatus,
  StreamingEventData
} from '../models/chat.types';

import { magicalChatAnimations } from '../utils/chat.animations';
import {AiChatService} from '../services/chat.service';

@Component({
  selector: 'app-magical-chat',
  standalone: false,
  templateUrl: './magical-chat.component.html',
  styleUrls: ['./magical-chat.component.scss'],
  animations: magicalChatAnimations,
})
export class MagicalChatComponent
  implements OnInit, AfterViewChecked, OnDestroy
{
  @ViewChild('messagesContainer', {static: false})
  messagesContainer!: ElementRef;
  @ViewChild('messageInput', {static: false}) messageInput!: ElementRef;

  // Services injection
  private fb = inject(FormBuilder);
  private aiChatService = inject(AiChatService);
  private hallsService = inject(HallsService);
  private sanitizer = inject(DomSanitizer);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  // private notificationService = inject(NotificationService); // Optional
  private injector = inject(Injector);

  // Form
  chatForm: FormGroup = this.fb.group({
    message: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(2000),
      ],
    ],
  });

  // Legacy properties (for compatibility)
  availableHalls: Hall[] = [];
  shouldScrollToBottom = false;
  isLoadingConversations = false;
  error: string | null = null;

  // Enhanced reactive state with signals
  sidebarCollapsed = signal(false);
  theme = signal<'light' | 'dark'>('dark');
  messageText = signal('');
  isInputFocused = signal(false);
  isRecording = signal(false);
  isLoading = signal(false);
  currentConversationId = signal<number | null>(null);
  conversations = signal<Conversation[]>([]);
  messages = signal<ChatDisplayMessage[]>([]);
  smartSuggestions = signal<string[]>([]);
  connectionStatus = signal<'connected' | 'connecting' | 'disconnected'>(
    'connected',
  );

  // Private state
  private destroy$ = new Subject<void>();
  private messageIdCounter = 0;
  private currentEventSource: EventSource | null = null;
  private autoScrollEnabled = signal(true);

  // Computed properties for template
  getCurrentConversationTitle = computed(() => {
    const currentId = this.currentConversationId();
    if (!currentId) return 'AI Assistant';

    const conversation = this.conversations().find((c) => c.id === currentId);
    return conversation?.topic || 'AI Chat';
  });

  getSubtitleText = computed(() => {
    const messageCount = this.messages().length;
    const hasStreaming = this.messages().some((m) => m.isStreaming);
    const status = this.connectionStatus();

    if (hasStreaming) return 'AI is responding...';
    if (status !== 'connected') return `Status: ${status}`;
    if (messageCount === 0)
      return 'Powered by advanced AI • Real-time responses';

    const exchanges = Math.floor(messageCount / 2);
    return `${exchanges} exchange${exchanges !== 1 ? 's' : ''} • Connected`;
  });

  canSendMessage = computed(() => {
    const formValid = this.chatForm.valid;
    const notLoading = !this.isLoading();
    const hasContent = this.messageText().trim().length > 0;
    const isConnected = this.connectionStatus() === 'connected';
    const messageControl = this.chatForm.get('message');
    const controlEnabled = messageControl?.enabled ?? true;

    return formValid && notLoading && hasContent && isConnected && controlEnabled;
  });

  // Constructor and lifecycle
  constructor() {
    this.setupEffects();
    this.setupKeyboardShortcuts();
    this.setupConversationEffects();
  }

  ngOnInit(): void {
    this.initializeChat();
    this.loadUserPreferences();
    this.loadConversations();
    this.setupRealtimeConnection();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && this.autoScrollEnabled()) {
      this.scrollToBottomSmooth();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.closeEventSource();
  }

  // ===================================================================
  // INITIALIZATION & SETUP
  // ===================================================================

  private setupEffects(): void {
    // Auto-resize textarea when text changes
    effect(() => {
      const text = this.messageText();
      setTimeout(() => this.autoResizeTextarea(), 0);
      this.updateSmartSuggestions(text);
    });

    // Theme management
    effect(() => {
      const theme = this.theme();
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('ai-chat-theme', theme);
    });

    // Sidebar persistence
    effect(() => {
      const collapsed = this.sidebarCollapsed();
      localStorage.setItem('ai-chat-sidebar', collapsed.toString());
    });

    // Form control disabled state management
    effect(() => {
      const shouldDisable = this.isLoading() || this.connectionStatus() !== 'connected';
      const messageControl = this.chatForm.get('message');

      if (shouldDisable && messageControl?.enabled) {
        messageControl.disable({ emitEvent: false });
      } else if (!shouldDisable && messageControl?.disabled) {
        messageControl.enable({ emitEvent: false });
      }
    });

    // Form value synchronization
    this.chatForm
      .get('message')
      ?.valueChanges.pipe(debounceTime(100), takeUntil(this.destroy$))
      .subscribe((value) => {
        this.messageText.set(value || '');
      });

    // Auto-scroll management
    effect(() => {
      const messages = this.messages();
      if (messages.length > 0) {
        this.shouldScrollToBottom = true;
      }
    });
  }

  private setupConversationEffects(): void {
    // Effect for conversation loading
    effect(() => {
      const conversations = this.aiChatService.conversations();
      this.conversations.set(conversations);

      // Auto-select first conversation if none selected and conversations exist
      if (conversations.length > 0 && !this.currentConversationId()) {
        // Don't auto-select to allow new conversation
        // this.selectConversation(conversations[0].id);
      }
    });

    // Effect for message loading
    effect(() => {
      const messages = this.aiChatService.messages();
      this.messages.set(messages);
      this.shouldScrollToBottom = true;
    });
  }

  private setupKeyboardShortcuts(): void {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        // Global shortcuts
        if (event.metaKey || event.ctrlKey) {
          switch (event.key) {
            case 'k':
              event.preventDefault();
              this.startNewConversation();
              break;
            case 'b':
              event.preventDefault();
              this.toggleSidebar();
              break;
            case '/':
              event.preventDefault();
              this.focusInput();
              break;
          }
        }

        // Escape to clear or close
        if (event.key === 'Escape') {
          if (this.messageText().trim()) {
            this.clearInput();
          } else if (!this.sidebarCollapsed()) {
            this.sidebarCollapsed.set(true);
          }
        }
      });
  }

  private initializeChat(): void {
    this.loadAvailableHalls();
    this.addWelcomeMessage();
  }

  private loadUserPreferences(): void {
    // Theme preference
    const savedTheme = localStorage.getItem('ai-chat-theme') as
      | 'light'
      | 'dark';
    if (savedTheme) this.theme.set(savedTheme);

    // Sidebar preference
    const sidebarCollapsed = localStorage.getItem('ai-chat-sidebar') === 'true';
    this.sidebarCollapsed.set(sidebarCollapsed);
  }

  private setupRealtimeConnection(): void {
    // Monitor online status
    fromEvent(window, 'online')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.connectionStatus.set('connected');
      });

    fromEvent(window, 'offline')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.connectionStatus.set('disconnected');
      });

    // Initial connection status
    this.connectionStatus.set(navigator.onLine ? 'connected' : 'disconnected');
  }

  // ===================================================================
  // CONVERSATION MANAGEMENT
  // ===================================================================

  loadConversations(): void {
    const currentHall = this.hallsService.getCurrentHall();
    this.aiChatService.loadConversations(currentHall?.id);
    // Effect is now handled in setupConversationEffects()
  }

  selectConversation(conversationId: number): void {
    if (this.currentConversationId() === conversationId) return;

    this.currentConversationId.set(conversationId);
    this.loadMessagesForConversation(conversationId);

    // Auto-collapse sidebar on mobile
    if (window.innerWidth <= 768) {
      this.sidebarCollapsed.set(true);
    }
  }

  private loadMessagesForConversation(conversationId: number): void {
    this.aiChatService.loadMessages(conversationId);
    // Effect is now handled in setupConversationEffects()
  }

  startNewConversation(): void {
    this.currentConversationId.set(null);
    this.messages.set([]);
    this.error = null;
    this.closeEventSource();
    this.addWelcomeMessage();
    this.clearInput();

    setTimeout(() => this.focusInput(), 100);
  }

  // ===================================================================
  // MESSAGE HANDLING
  // ===================================================================

  sendQuickMessage(message: string): void {
    this.chatForm.patchValue({message});
    this.messageText.set(message);
    this.onSubmit();
  }

  onSubmit(): void {
    if (!this.canSendMessage()) return;

    const messageText = this.chatForm.get('message')?.value?.trim();
    if (!messageText) return;

    this.sendMessage(messageText);
  }

  private sendMessage(messageText: string): void {
    if (this.connectionStatus() !== 'connected') {
      this.showNotification(
        'Please check your connection and try again.',
        'error',
      );
      return;
    }

    const effectiveHallIds = this.getEffectiveHallIds();

    // Create optimistic user message
    const userMessage: ChatDisplayMessage = {
      id: this.generateMessageId(),
      message: messageText,
      hallIds: effectiveHallIds,
      timestamp: new Date(),
      type: 'user',
      status: 'sending',
    };

    // Create streaming assistant message
    const assistantMessage: ChatDisplayMessage = {
      id: this.generateMessageId(),
      message: '',
      hallIds: effectiveHallIds,
      timestamp: new Date(),
      type: 'assistant',
      isStreaming: true,
      streamingContent: '',
    };

    // Add messages optimistically
    this.messages.update((msgs) => [...msgs, userMessage, assistantMessage]);
    this.shouldScrollToBottom = true;

    // Clear form and set loading state
    this.clearInput();
    this.isLoading.set(true);

    // Update user message status after delay
    setTimeout(() => {
      this.updateMessageStatus(userMessage.id, 'sent');
    }, 300);

    // Send request
    const request: AIChatRequest = {
      message: messageText,
      hallIds: effectiveHallIds,
      conversationId: this.currentConversationId() || undefined,
    };

    this.aiChatService
      .sendMessageStreaming(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.handleSuccessfulResponse(
            response,
            userMessage.id,
            assistantMessage.id,
          );
        },
        error: (error) => {
          this.handleMessageError(error, userMessage.id, assistantMessage.id);
        },
      });
  }

  private handleSuccessfulResponse(
    response: EnhancedAIChatResponse,
    userMessageId: string,
    assistantMessageId: string,
  ): void {
    // Update user message to delivered
    this.updateMessageStatus(userMessageId, 'delivered');

    // Handle new conversation
    if (response.conversationId && !this.currentConversationId()) {
      this.currentConversationId.set(response.conversationId);
      this.loadConversations(); // Refresh conversations list
    }

    // Start streaming or handle traditional response
    if (response.streamUrl) {
      this.startEventStream(response.streamUrl, assistantMessageId);
    } else {
      // Fallback to traditional response
      this.completeMessage(
        assistantMessageId,
        response.explanation || 'Response received',
      );

      // Add chart if available
      if (response.url) {
        this.updateMessageChart(assistantMessageId, response.url);
      }
    }
  }

  private startEventStream(streamUrl: string, messageId: string): void {
    this.closeEventSource();

    try {
      this.currentEventSource = new EventSource(streamUrl);
      let accumulatedContent = '';
      let lastUpdateTime = Date.now();

      this.currentEventSource.onopen = () => {
        console.log('Stream connection established');
        this.connectionStatus.set('connected');
      };

      this.currentEventSource.onmessage = (event) => {
        try {
          const data: StreamingEventData = JSON.parse(event.data);
          const currentTime = Date.now();

          if (data.type === 'content' || data.type === 'delta') {
            accumulatedContent += data.content || data.delta || '';

            // Throttle updates for smooth animation (max 30fps for better performance)
            if (currentTime - lastUpdateTime > 33) {
              this.updateStreamingContent(messageId, accumulatedContent);
              lastUpdateTime = currentTime;
            }
          } else if (data.type === 'done' || data.type === 'complete') {
            this.completeStreamingMessage(messageId, accumulatedContent);
          } else if (data.type === 'error') {
            this.handleStreamingError(
              data.error || 'Stream error occurred',
              messageId,
            );
          }
        } catch (parseError) {
          console.error('Error parsing stream data:', parseError);
          this.handleStreamingError('Invalid response format', messageId);
        }
      };

      this.currentEventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        this.connectionStatus.set('disconnected');
        this.handleStreamingError('Connection interrupted', messageId);
      };
    } catch (error) {
      console.error('Failed to create EventSource:', error);
      this.handleStreamingError('Failed to establish connection', messageId);
    }
  }

  private updateStreamingContent(messageId: string, content: string): void {
    this.messages.update((msgs) =>
      msgs.map((msg) =>
        msg.id === messageId ? {...msg, streamingContent: content} : msg,
      ),
    );
    this.shouldScrollToBottom = true;
  }

  private completeStreamingMessage(messageId: string, content: string): void {
    this.messages.update((msgs) =>
      msgs.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              message: content,
              streamingContent: '',
              isStreaming: false,
              status: 'delivered' as MessageStatus,
            }
          : msg,
      ),
    );

    this.isLoading.set(false);
    this.closeEventSource();

    // Refresh conversations to update lastMessage timestamp
    setTimeout(() => {
      this.aiChatService.refreshConversations();
    }, 500);
  }

  private completeMessage(messageId: string, content: string): void {
    this.messages.update((msgs) =>
      msgs.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              message: content,
              isStreaming: false,
              status: 'delivered' as MessageStatus,
            }
          : msg,
      ),
    );
  }

  private updateMessageChart(messageId: string, chartUrl: string): void {
    this.messages.update((msgs) =>
      msgs.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              chartUrl: this.sanitizer.bypassSecurityTrustResourceUrl(chartUrl),
            }
          : msg,
      ),
    );
  }

  private handleMessageError(
    error: any,
    userMessageId: string,
    assistantMessageId: string,
  ): void {
    // Update user message as failed
    this.updateMessageStatus(userMessageId, 'failed');

    // Update assistant message with error
    this.messages.update((msgs) =>
      msgs.map((msg) =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              error: error.message || 'Failed to send message',
              isStreaming: false,
              status: 'failed' as MessageStatus,
            }
          : msg,
      ),
    );

    this.showNotification(error.message || 'Failed to send message', 'error');
  }

  private handleStreamingError(error: string, messageId: string): void {
    this.messages.update((msgs) =>
      msgs.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              error,
              isStreaming: false,
              status: 'failed' as MessageStatus,
            }
          : msg,
      ),
    );

    this.isLoading.set(false);
    this.closeEventSource();
    this.showNotification(error, 'error');
  }

  // ===================================================================
  // UI ACTIONS
  // ===================================================================

  toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  toggleTheme(): void {
    const newTheme = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(newTheme);

    // Add smooth transition class
    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 300);
  }

  toggleVoiceInput(): void {
    if (this.isRecording()) {
      this.stopVoiceRecording();
    } else {
      this.startVoiceRecording();
    }
  }

  clearCurrentConversation(): void {
    this.messages.set([]);
    this.error = null;
    this.addWelcomeMessage();
    this.focusInput();
  }

  // ===================================================================
  // MESSAGE ACTIONS
  // ===================================================================

  retryMessage(message: ChatDisplayMessage): void {
    const msgs = this.messages();
    const messageIndex = msgs.findIndex((m) => m.id === message.id);

    if (messageIndex > 0) {
      const previousMessage = msgs[messageIndex - 1];
      if (previousMessage.type === 'user') {
        // Remove failed message
        this.messages.update((msgs) => msgs.filter((m) => m.id !== message.id));
        // Resend previous user message
        this.sendMessage(previousMessage.message);
      }
    }
  }

  regenerateResponse(message: ChatDisplayMessage): void {
    this.retryMessage(message);
  }

  copyMessage(content: string): void {
    if (!content) return;

    navigator.clipboard
      .writeText(content)
      .then(() => {
        this.showNotification('Message copied to clipboard', 'success');
      })
      .catch(() => {
        this.showNotification('Failed to copy message', 'error');
      });
  }

  // ===================================================================
  // INPUT HANDLING
  // ===================================================================

  onInputChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.messageText.set(textarea.value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (!event.shiftKey && !event.ctrlKey) {
        event.preventDefault();
        this.onSubmit();
      } else if (event.ctrlKey) {
        event.preventDefault();
        this.onSubmit();
      }
      // Shift + Enter allows new line (default behavior)
    }
  }

  private autoResizeTextarea(): void {
    if (!this.messageInput?.nativeElement) return;

    const textarea = this.messageInput.nativeElement;

    // Reset height to calculate new height
    textarea.style.height = 'auto';

    // Calculate new height with constraints
    const scrollHeight = textarea.scrollHeight;
    const minHeight = 24; // Single line
    const maxHeight = 120; // ~5 lines
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

    // Apply new height
    textarea.style.height = newHeight + 'px';
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  private focusInput(): void {
    setTimeout(() => {
      this.messageInput?.nativeElement?.focus();
    }, 100);
  }

  private clearInput(): void {
    this.chatForm.reset();
    this.messageText.set('');
  }

  // ===================================================================
  // SMART FEATURES
  // ===================================================================

  private updateSmartSuggestions(input: string): void {
    if (!input || input.length < 3) {
      this.smartSuggestions.set([]);
      return;
    }

    const suggestions: string[] = [];
    const lowerInput = input.toLowerCase();

    // Business analytics suggestions
    if (
      lowerInput.includes('revenue') ||
      lowerInput.includes('income') ||
      lowerInput.includes('profit')
    ) {
      suggestions.push(
        'Compare revenue month over month',
        'Revenue breakdown by hall',
        'Profit margin analysis',
      );
    } else if (
      lowerInput.includes('booking') ||
      lowerInput.includes('reservation')
    ) {
      suggestions.push(
        'Recent booking trends',
        'Peak booking hours analysis',
        'Booking conversion rates',
      );
    } else if (
      lowerInput.includes('customer') ||
      lowerInput.includes('client')
    ) {
      suggestions.push(
        'Customer satisfaction metrics',
        'Top customers by revenue',
        'Customer retention analysis',
      );
    } else if (lowerInput.includes('hall') || lowerInput.includes('venue')) {
      suggestions.push(
        'Hall utilization rates',
        'Most popular venues',
        'Hall performance comparison',
      );
    } else if (
      lowerInput.includes('performance') ||
      lowerInput.includes('kpi')
    ) {
      suggestions.push(
        'Key performance indicators',
        'Monthly performance summary',
        'Performance vs targets',
      );
    }

    this.smartSuggestions.set(suggestions.slice(0, 3));
  }

  onQuickAction(action: string): void {
    const actionMap: Record<string, string> = {
      revenue:
        'Show me detailed revenue analytics and trends for the last 6 months',
      bookings: 'Analyze recent booking patterns and provide insights',
      customers: 'Provide comprehensive customer insights and metrics',
      performance: 'Show me key performance indicators and business metrics',
    };

    const message = actionMap[action] || `Show me ${action} information`;
    this.sendQuickMessage(message);
  }

  // ===================================================================
  // VOICE FEATURES (PLACEHOLDER)
  // ===================================================================

  private startVoiceRecording(): void {
    // Voice recording implementation
    this.isRecording.set(true);
    console.log('Voice recording started');

    // Mock implementation - replace with actual voice API
    setTimeout(() => {
      this.stopVoiceRecording();
      this.messageText.set('Voice input: Show me revenue trends');
      this.chatForm.patchValue({
        message: 'Voice input: Show me revenue trends',
      });
    }, 3000);
  }

  private stopVoiceRecording(): void {
    this.isRecording.set(false);
    console.log('Voice recording stopped');
  }

  // ===================================================================
  // UTILITY METHODS
  // ===================================================================

  private loadAvailableHalls(): void {
    // Implementation depends on your halls service structure
    try {
      const currentHall = this.hallsService.getCurrentHall();
      if (currentHall) {
        this.availableHalls = [currentHall];
      }
    } catch (error) {
      console.warn('Could not load halls:', error);
      this.availableHalls = [];
    }
  }

  private addWelcomeMessage(): void {
    const welcomeMessage: ChatDisplayMessage = {
      id: this.generateMessageId(),
      message: this.getWelcomeMessage(),
      hallIds: [],
      timestamp: new Date(),
      type: 'assistant',
      status: 'delivered',
    };

    this.messages.update((msgs) => [welcomeMessage]);
    this.shouldScrollToBottom = true;
  }

  private getWelcomeMessage(): string {
    return (
      this.translate.instant('analytics.aiChat.welcome') ||
      "Hello! I'm your AI assistant. I can help you analyze your business data, track performance, and provide insights. What would you like to know?"
    );
  }

  private updateMessageStatus(messageId: string, status: MessageStatus): void {
    this.messages.update((msgs) =>
      msgs.map((msg) => (msg.id === messageId ? {...msg, status} : msg)),
    );
  }

  private scrollToBottomSmooth(): void {
    if (!this.messagesContainer?.nativeElement) return;

    const container = this.messagesContainer.nativeElement;

    // Check if user has scrolled up (manual scroll)
    const isNearBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 100;

    if (isNearBottom || this.messages().some((m) => m.isStreaming)) {
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }

  private closeEventSource(): void {
    if (this.currentEventSource) {
      this.currentEventSource.close();
      this.currentEventSource = null;
    }
  }

  protected getEffectiveHallIds(): number[] {
    const currentHall = this.hallsService.getCurrentHall();
    return currentHall ? [currentHall.id] : [];
  }

  private generateMessageId(): string {
    return `msg_${++this.messageIdCounter}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private showNotification(
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
  ): void {
    // Implementation depends on your notification system
    console.log(`${type.toUpperCase()}: ${message}`);

    // If you have NotificationService:
    // this.notificationService?.show(message, type);
  }

  // ===================================================================
  // TEMPLATE HELPER METHODS
  // ===================================================================

  getCurrentHallName(): string | null {
    const currentHall = this.hallsService.getCurrentHall();
    return currentHall?.name || null;
  }

  getInputPlaceholder(): string {
    if (this.isLoading()) return 'AI is responding...';
    if (this.connectionStatus() !== 'connected') return 'Reconnecting...';
    if (this.currentConversationId()) return 'Continue the conversation...';
    return 'Ask me anything about your business...';
  }

  formatTime(timestamp: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(timestamp);
  }

  formatConversationTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  }

  isRecentActivity(timestamp: string): boolean {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);
    return diffMinutes < 30;
  }

  renderMarkdown(content: string): string {
    if (!content) return '';

    return (
      content
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold and italic
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Code blocks
        .replace(
          /```([\s\S]*?)```/g,
          '<pre class="code-block"><code>$1</code></pre>',
        )
        .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
        // Lists
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        // Links
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
        )
        // Line breaks
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>')
    );
  }

  // Track functions for performance
  trackMessage = (index: number, message: ChatDisplayMessage) => message.id;
  trackConversation = (index: number, conversation: Conversation) =>
    conversation.id;
}

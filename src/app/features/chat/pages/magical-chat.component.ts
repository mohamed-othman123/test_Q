import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subject, takeUntil} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {AiChatService} from '../services/chat.service';
import {HallsService} from '@halls/services/halls.service';
import {LanguageService} from '@core/services/language.service';
import {
  ChatDisplayMessage,
  Conversation,
  AIChatRequest,
} from '../models/chat.types';
import {Hall} from '@halls/models/halls.model';

@Component({
  selector: 'app-magical-chat',
  standalone: false,
  template: `
    <div
      class="magical-chat-container"
      [attr.data-theme]="theme()"
      [class.sidebar-collapsed]="sidebarCollapsed()"
      [class.rtl]="isRTL">
      <div class="chat-main">
        <app-chat-header
          [title]="getCurrentConversationTitle()"
          [subtitle]="getSubtitleText()"
          [theme]="theme()"
          [sidebarCollapsed]="sidebarCollapsed()"
          (themeChange)="toggleTheme()"
          (sidebarToggle)="toggleSidebar()">
        </app-chat-header>

        <app-message-list
          #messageList
          [messages]="messages()"
          [isLoading]="isLoading()"
          [isLoadingConversation]="isLoadingConversation()"
          (quickMessage)="sendQuickMessage($event)">
        </app-message-list>

        <app-message-input
          [form]="chatForm"
          [canSend]="canSendMessage()"
          [isLoading]="isLoading()"
          [showQuickActions]="messages().length === 0"
          (send)="sendMessage($event)"
          (quickMessage)="sendQuickMessage($event)">
        </app-message-input>
      </div>

      <app-conversations-sidebar
        [collapsed]="sidebarCollapsed()"
        [conversations]="conversations()"
        [currentConversationId]="currentConversationId()"
        [isLoading]="isLoadingConversations()"
        (toggle)="toggleSidebar()"
        (newChat)="startNewConversation()"
        (selectConversation)="selectConversation($event)"
        (loadConversations)="loadConversations()">
      </app-conversations-sidebar>
    </div>
  `,
  styleUrls: ['./magical-chat.component.scss'],
})
export class MagicalChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private destroy$ = new Subject<void>();

  @ViewChild('messageList', {static: false}) messageListComponent!: ElementRef;

  chatForm: FormGroup;
  private shouldScrollToBottom = false;
  private previousMessageCount = 0;

  constructor(
    private fb: FormBuilder,
    private aiChatService: AiChatService,
    private hallsService: HallsService,
    private languageService: LanguageService,
    private translateService: TranslateService,
  ) {
    this.chatForm = this.fb.group({
      message: [
        {value: '', disabled: false},
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(2000),
        ],
      ],
    });

    effect(() => {
      const messages = this.messages();
      const currentCount = messages.length;

      if (currentCount > this.previousMessageCount) {
        this.shouldScrollToBottom = true;
        this.previousMessageCount = currentCount;
      }
    });
  }

  sidebarCollapsed = signal(false);
  theme = signal<'light' | 'dark'>('light');
  isLoading = signal(false);
  isLoadingConversation = signal(false);
  currentConversationId = signal<number | null>(null);
  messages = signal<ChatDisplayMessage[]>([]);
  connectionStatus = signal<'connected' | 'connecting' | 'disconnected'>(
    'connected',
  );
  currentHall = signal<Hall | null>(null);

  conversations = computed(() => this.aiChatService.conversations());
  isLoadingConversations = computed(() =>
    this.aiChatService.isLoadingConversations(),
  );

  get isRTL(): boolean {
    return this.languageService.getCurrentLanguage() === 'ar';
  }

  private themeEffect = effect(() => {
    const theme = this.theme();
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ai-chat-theme', theme);
  });

  private sidebarEffect = effect(() => {
    const collapsed = this.sidebarCollapsed();
    localStorage.setItem('ai-chat-sidebar', collapsed.toString());
  });

  private messagesEffect = effect(() => {
    const messages = this.aiChatService.messages();
    const currentConversationId = this.currentConversationId();

    if (currentConversationId) {
      this.messages.set(messages);
    } else {
      this.messages.set([]);
    }
  });

  private hallEffect = effect(() => {
    const currentHall = this.currentHall();
    if (currentHall?.id) {
      this.aiChatService.loadConversations(currentHall.id);
    }
  });

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private retryLoadConversations(): void {
    let retryCount = 0;
    const maxRetries = 5;

    const tryLoad = () => {
      const hall = this.hallsService.getCurrentHall();
      if (hall?.id) {
        this.currentHall.set(hall);
        setTimeout(() => this.loadConversations(), 100);
        return;
      }

      retryCount++;
      if (retryCount < maxRetries) {
        setTimeout(tryLoad, 300 * retryCount);
      } else {
        console.warn('Failed to load hall after retries');
      }
    };

    tryLoad();
  }

  getCurrentConversationTitle = computed(() => {
    const currentId = this.currentConversationId();
    if (!currentId) return this.translateService.instant('chat.newChat');
    const conversation = this.conversations().find((c) => c.id === currentId);
    return conversation?.topic || this.translateService.instant('chat.newChat');
  });

  getSubtitleText = computed(() => {
    const currentId = this.currentConversationId();
    const messageCount = this.messages().length;
    const hasStreaming = this.messages().some((m) => m.isStreaming);
    const status = this.connectionStatus();

    if (hasStreaming) return this.translateService.instant('chat.aiThinking');
    if (status !== 'connected') return `Connection status: ${status}`;
    if (!currentId)
      return this.translateService.instant('chat.startConversation');
    if (messageCount === 0) return 'Powered by advanced AI • Ready to help';

    const userMessages = this.messages().filter(
      (m) => m.type === 'user',
    ).length;
    const aiMessages = this.messages().filter(
      (m) => m.type === 'assistant',
    ).length;

    if (userMessages === 0) return 'Conversation loaded • Ready to chat';

    const messageText =
      userMessages === 1
        ? this.translateService.instant('chat.messageSent')
        : this.translateService.instant('chat.messagesSent');

    const responseText =
      aiMessages === 1
        ? this.translateService.instant('chat.response')
        : this.translateService.instant('chat.responses');

    const activeText = this.translateService.instant('chat.active');

    return `${userMessages} ${messageText} • ${aiMessages} ${responseText} • ${activeText}`;
  });

  messageValue = signal('');

  canSendMessage = computed(() => {
    const messageControl = this.chatForm.get('message');
    const messageValue = this.messageValue() || messageControl?.value || '';
    const hasContent = messageValue.trim().length > 0;
    const notLoading = !this.isLoading();
    const isConnected = this.connectionStatus() === 'connected';
    const formValid = messageControl?.valid !== false;
    const withinCharLimit = messageValue.length <= 2000;

    if (this.isLoading() && messageControl && !messageControl.disabled) {
      messageControl.disable();
    } else if (!this.isLoading() && messageControl && messageControl.disabled) {
      messageControl.enable();
    }

    return hasContent && notLoading && isConnected && formValid && withinCharLimit;
  });

  ngOnInit(): void {
    this.loadUserPreferences();

    this.chatForm
      .get('message')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.messageValue.set(value || '');
      });

    const initialHall = this.hallsService.getCurrentHall();
    if (initialHall) {
      this.currentHall.set(initialHall);
      setTimeout(() => this.loadConversations(), 100);
    } else {
      this.retryLoadConversations();
    }

    this.hallsService.currentHall$
      .pipe(takeUntil(this.destroy$))
      .subscribe((hall) => {
        if (hall) {
          this.currentHall.set(hall);
          setTimeout(() => this.loadConversations(), 100);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserPreferences(): void {
    const savedTheme = localStorage.getItem('ai-chat-theme') as
      | 'light'
      | 'dark';
    if (savedTheme) {
      this.theme.set(savedTheme);
    } else {
      this.theme.set('light');
      localStorage.setItem('ai-chat-theme', 'light');
    }

    const sidebarCollapsed = localStorage.getItem('ai-chat-sidebar') === 'true';
    this.sidebarCollapsed.set(sidebarCollapsed);
  }

  toggleTheme(): void {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  loadConversations(): void {
    const currentHall = this.currentHall();
    if (!currentHall?.id) return;
    this.aiChatService.loadConversations(currentHall.id);
  }

  selectConversation(conversationId: number): void {
    if (this.currentConversationId() === conversationId) return;

    this.currentConversationId.set(conversationId);
    this.isLoadingConversation.set(true);

    this.messages.set([]);

    this.aiChatService.loadMessages(conversationId);

    const checkMessages = () => {
      const messages = this.aiChatService.messages();
      if (messages.length > 0 || !this.aiChatService.isLoadingMessages()) {
        this.isLoadingConversation.set(false);
        setTimeout(() => {
          this.shouldScrollToBottom = true;
        }, 100);
      } else {
        setTimeout(checkMessages, 100);
      }
    };

    setTimeout(checkMessages, 100);

    if (window.innerWidth <= 768) {
      this.sidebarCollapsed.set(true);
    }
  }

  startNewConversation(): void {
    this.currentConversationId.set(null);
    this.messages.set([]);
    this.chatForm.reset();
    this.aiChatService.clearMessages();
    this.previousMessageCount = 0;
  }

  sendMessage(messageText: string): void {
    if (!this.canSendMessage()) return;

    this.isLoading.set(true);

    const userMessage: ChatDisplayMessage = {
      id: `user_${Date.now()}`,
      message: messageText,
      hallIds: [],
      timestamp: new Date(),
      type: 'user',
      status: 'delivered',
    };

    this.messages.update((messages) => [...messages, userMessage]);

    const request: AIChatRequest = {
      message: messageText,
      hallIds: this.currentHall()?.id ? [this.currentHall()!.id] : [],
      conversationId: this.currentConversationId() || undefined,
    };

    this.aiChatService.sendMessageStreaming(request).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        this.chatForm.reset();

        const aiResponse: ChatDisplayMessage = {
          id: `ai_${Date.now()}`,
          message:
            response.explanation ||
            response.message ||
            this.translateService.instant('chat.couldNotProcess'),
          hallIds: request.hallIds,
          timestamp: new Date(),
          type: 'assistant',
          status: 'delivered',
        };

        console.log('User message:', userMessage);
        console.log('AI request:', request);
        console.log('AI response:', aiResponse);

        this.messages.update((messages) => [...messages, aiResponse]);

        if (!this.currentConversationId() && response.conversationId) {
          console.log('New conversation created with ID:', response.conversationId);
          this.currentConversationId.set(response.conversationId);
        }

        setTimeout(() => {
          console.log('Refreshing conversations after response...');
          this.aiChatService.refreshConversationsAndSelectLatest();
        }, 300);
      },
      error: (error: any) => {
        console.error('Error sending message:', error);
        this.isLoading.set(false);
        this.chatForm.reset();

        const errorResponse: ChatDisplayMessage = {
          id: `error_${Date.now()}`,
          message: this.translateService.instant('chat.errorProcessing'),
          hallIds: [],
          timestamp: new Date(),
          type: 'assistant',
          status: 'failed',
        };

        console.log('User message:', userMessage);
        console.log('AI request:', request);
        console.log('Error response message:', errorResponse);

        this.messages.update((messages) => [...messages, errorResponse]);
      },
    });
  }

  sendQuickMessage(message: string): void {
    this.chatForm.patchValue({message});
    this.sendMessage(message);
  }

  private scrollToBottom(): void {
    try {
      if (this.messageListComponent?.nativeElement) {
        const messagesContainer = this.messageListComponent.nativeElement.querySelector('.messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth',
          });
          return;
        }
      }

      const containers = [
        '.messages-container',
        '.chat-main .messages-container',
        '[class*="messages-container"]'
      ];

      for (const selector of containers) {
        const container = document.querySelector(selector) as HTMLElement;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          });
          return;
        }
      }

      const chatMain = document.querySelector('.chat-main') as HTMLElement;
      if (chatMain) {
        chatMain.scrollTo({
          top: chatMain.scrollHeight,
          behavior: 'smooth',
        });
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}

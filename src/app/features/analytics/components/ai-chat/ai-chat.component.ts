import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import {
  AIAnalyticsService,
  AIChatMessage,
  AIChatResponse,
  AIChatRequest,
  Hall
} from '../../a-i-analytics.service';
import { HallsService } from '@halls/services/halls.service';
import { TranslateService } from '@ngx-translate/core';
import { chatAnimations } from '../chat-animations';
import { LanguageService } from '@core/services/language.service';

interface ChatDisplayMessage extends AIChatMessage {
  isLoading?: boolean;
  chartUrl?: SafeResourceUrl;
  error?: string;
}

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss'],
  animations: chatAnimations,
  standalone: false
})
export class AiChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  chatForm: FormGroup;
  messages: ChatDisplayMessage[] = [];
  availableHalls: Hall[] = [];
  selectedHallIds: number[] = [];
  currentHallId: number | null = null;
  isLoading = false;
  isInitializing = true;
  error: string | null = null;

  showHallSelector = false;
  shouldScrollToBottom = false;

  private destroy$ = new Subject<void>();
  private messageIdCounter = 0;

  constructor(
    private fb: FormBuilder,
    private analyticsService: AIAnalyticsService,
    private hallsService: HallsService,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.initializeChat();
    this.addWelcomeMessage();

    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateWelcomeMessage();
      });
  }

  private updateWelcomeMessage(): void {
    const welcomeIndex = this.messages.findIndex(m =>
      m.type === 'assistant' && m.message.includes('👋')
    );

    if (welcomeIndex !== -1) {
      this.messages[welcomeIndex].message = this.translate.instant('analytics.aiChat.welcome');
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private initializeChat(): void {
    this.isInitializing = true;

    const currentHall = this.hallsService.getCurrentHall();
    if (currentHall) {
      this.currentHallId = currentHall.id;
    }

    this.hallsService.halls$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (halls) => {
          this.availableHalls = halls.map(hall => ({
            id: hall.id,
            name: this.languageService.getCurrentLanguage() === 'ar' && hall.name_ar
              ? hall.name_ar
              : hall.name
          }));

          this.setInitialHallSelection();

          this.isInitializing = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.handleHallsLoadError();
          this.isInitializing = false;
          this.cdr.detectChanges();
        }
      });
  }

  private setInitialHallSelection(): void {
    if (this.currentHallId) {
      this.selectedHallIds = [this.currentHallId];

      const otherHalls = this.availableHalls.filter(h => h.id !== this.currentHallId);
      if (otherHalls.length > 0) {
        this.selectedHallIds.push(otherHalls[0].id);
      }
    } else if (this.availableHalls.length > 0) {
      this.selectedHallIds = this.availableHalls
        .slice(0, 2)
        .map(h => h.id);
    }
  }

  private handleHallsLoadError(): void {
    if (this.currentHallId) {
      this.selectedHallIds = [this.currentHallId];
      this.availableHalls = [
        { id: this.currentHallId, name: `Current Hall (${this.currentHallId})` }
      ];
    } else {
      this.selectedHallIds = [];
      this.availableHalls = [];
      this.error = 'Unable to load hall information. Some analytics features may be limited.';
    }
  }

  protected getEffectiveHallIds(): number[] {
    const currentHall = this.hallsService.getCurrentHall();
    return currentHall ? [currentHall.id] : [];
  }

  private addWelcomeMessage(): void {
    const welcomeMessage: ChatDisplayMessage = {
      id: this.generateMessageId(),
      message: this.translate.instant('analytics.aiChat.welcome'),
      hallIds: [],
      timestamp: new Date(),
      type: 'assistant'
    };

    this.messages.push(welcomeMessage);
    this.shouldScrollToBottom = true;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.chatForm.invalid || this.isLoading) {
      return;
    }

    const messageText = this.chatForm.get('message')?.value.trim();
    if (!messageText) {
      return;
    }

    this.sendMessage(messageText);
  }

  private sendMessage(messageText: string): void {
    const effectiveHallIds = this.getEffectiveHallIds();

    const userMessage: ChatDisplayMessage = {
      id: this.generateMessageId(),
      message: messageText,
      hallIds: effectiveHallIds,
      timestamp: new Date(),
      type: 'user'
    };

    this.messages.push(userMessage);

    const loadingMessage: ChatDisplayMessage = {
      id: this.generateMessageId(),
      message: this.translate.instant('analytics.aiChat.states.processing'),
      hallIds: effectiveHallIds,
      timestamp: new Date(),
      type: 'assistant',
      isLoading: true
    };

    this.messages.push(loadingMessage);
    this.shouldScrollToBottom = true;
    this.cdr.detectChanges();

    this.chatForm.reset();
    this.isLoading = true;

    const request: AIChatRequest = {
      message: messageText,
      hallIds: effectiveHallIds
    };

    this.analyticsService.sendAIChatMessage(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.handleChatResponse(response, loadingMessage);
        },
        error: (error) => {
          this.handleChatError(error, loadingMessage);
        }
      });
  }

  private handleChatResponse(response: AIChatResponse, loadingMessage: ChatDisplayMessage): void {
    const loadingIndex = this.messages.findIndex(m => m.id === loadingMessage.id);
    if (loadingIndex !== -1) {
      this.messages.splice(loadingIndex, 1);
    }

    const responseMessage: ChatDisplayMessage = {
      id: this.generateMessageId(),
      message: response.explanation,
      hallIds: this.getEffectiveHallIds(),
      timestamp: new Date(),
      type: 'assistant',
      chartUrl: this.sanitizer.bypassSecurityTrustResourceUrl(response.url),
    };

    this.messages.push(responseMessage);
    this.shouldScrollToBottom = true;
    this.isLoading = false;

    this.cdr.detectChanges();

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 10);
  }

  private handleChatError(error: any, loadingMessage: ChatDisplayMessage): void {
    const loadingIndex = this.messages.findIndex(m => m.id === loadingMessage.id);
    if (loadingIndex !== -1) {
      this.messages.splice(loadingIndex, 1);
    }

    const errorMessage: ChatDisplayMessage = {
      id: this.generateMessageId(),
      message: this.translate.instant('analytics.aiChat.states.error'),
      hallIds: this.getEffectiveHallIds(),
      timestamp: new Date(),
      type: 'assistant',
      error: 'Failed to generate visualization'
    };

    this.messages.push(errorMessage);
    this.shouldScrollToBottom = true;
    this.isLoading = false;

    this.cdr.detectChanges();
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) {
      // Silent fail
    }
  }

  private generateMessageId(): string {
    return `msg_${++this.messageIdCounter}_${Date.now()}`;
  }

  formatTime(timestamp: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  }

  getVisualizationIcon(type?: string): string {
    const iconMap: { [key: string]: string } = {
      'bar': 'pi-chart-bar',
      'line': 'pi-chart-line',
      'pie': 'pi-chart-pie',
      'table': 'pi-table',
      'metric': 'pi-calculator',
      'scatter': 'pi-circle'
    };

    return iconMap[type || 'bar'] || 'pi-chart-bar';
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  toggleHallSelection(hallId: number): void {
    const index = this.selectedHallIds.indexOf(hallId);
    if (index > -1) {
      this.selectedHallIds.splice(index, 1);
    } else {
      this.selectedHallIds.push(hallId);
    }
  }

  selectAllHalls(): void {
    this.selectedHallIds = this.availableHalls.map(hall => hall.id);
  }

  clearHallSelection(): void {
    this.selectedHallIds = [];
  }

  isUsingCurrentHall(): boolean {
    return this.currentHallId !== null;
  }

  getContextDisplayText(): string {
    const currentHall = this.hallsService.getCurrentHall();
    if (currentHall) {
      return this.translate.instant('analytics.aiChat.context.withCurrent', { count: 1 });
    }
    return this.translate.instant('analytics.aiChat.context.indicator', { count: 0 });
  }

  trackMessage(index: number, message: ChatDisplayMessage): string {
    return message.id;
  }

  trackHall(index: number, hall: Hall): number {
    return hall.id;
  }

  autoResizeTextarea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  onQuickAction(action: string): void {
    let message = '';
    switch (action) {
      case 'revenue':
        message = 'Show me revenue analysis for the selected halls';
        break;
      case 'bookings':
        message = 'Display booking trends over the last 3 months';
        break;
      case 'customers':
        message = 'Give me customer insights and satisfaction scores';
        break;
      default:
        return;
    }

    this.chatForm.patchValue({ message });
    this.messageInput.nativeElement.focus();
  }

  getCurrentHallName(): string {
    const currentHall = this.hallsService.getCurrentHall();
    if (!currentHall) {
      return '';
    }

    return this.translate.currentLang === 'ar' && currentHall.name_ar
      ? currentHall.name_ar
      : currentHall.name;
  }
}

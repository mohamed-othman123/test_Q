import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {HallsService} from '@halls/services/halls.service';
import {ChatService} from '../services/chat.service';
import {AIChatMessage, AIChatRequest, Hall} from '../models/chat.types';
import {Subject, takeUntil} from 'rxjs';
import {AIChatResponse} from '../../analytics/a-i-analytics.service';
import {chatAnimations} from '../utils/chat.animations';

interface ChatDisplayMessage extends AIChatMessage {
  isLoading?: boolean;
  chartUrl?: SafeResourceUrl;
  error?: string;
}

@Component({
  selector: 'app-chat-interface',
  standalone: false,
  animations: chatAnimations,
  template: `
    <div class="ai-chat-container">
      <div class="chat-header">
        <div class="header-content">
          <div class="chat-title">
            <div class="title-icon">
              <i class="pi pi-brain" *ngIf="!isLoading"></i>
              <i class="pi pi-spin pi-spinner" *ngIf="isLoading"></i>
            </div>
            <div class="title-text">
              <h2>{{ 'analytics.aiChat.title' | translate }}</h2>
              <p class="subtitle">
                {{ 'analytics.aiChat.subtitle' | translate }}
              </p>
            </div>
          </div>
          <!--TODO: Temp Hidden-->
          <div
            [hidden]="true"
            class="context-selector"
            *ngIf="availableHalls.length > 0">
            <button
              class="context-toggle-btn"
              [class.active]="showHallSelector"
              [class.current-hall-active]="isUsingCurrentHall()"
              (click)="showHallSelector = !showHallSelector"
              pButton
              type="button">
              <i class="pi pi-building"></i>
              <span class="hall-count">{{ getEffectiveHallIds().length }}</span>
              <span class="hall-text">{{ getContextDisplayText() }}</span>
              <i
                class="pi pi-star-fill current-hall-indicator"
                *ngIf="isUsingCurrentHall()"
                title="Current hall included"></i>
              <i
                class="pi pi-chevron-down"
                [class.rotated]="showHallSelector"></i>
            </button>

            <div class="hall-selector" *ngIf="showHallSelector" [@slideDown]>
              <div class="selector-header">
                <div class="header-text">
                  <i class="pi pi-building"></i>
                  <span>{{ 'analytics.aiChat.selectHalls' | translate }}</span>
                  <span class="current-hall-info" *ngIf="currentHallId">
                    <i class="pi pi-star"></i>
                    Current: {{ currentHallId }}
                  </span>
                </div>
                <div class="header-actions">
                  <button
                    class="action-btn select-all"
                    (click)="selectAllHalls()"
                    [disabled]="
                      selectedHallIds.length === availableHalls.length
                    ">
                    <i class="pi pi-check-circle"></i>
                    {{ 'analytics.aiChat.selectAll' | translate }}
                  </button>
                  <button
                    class="action-btn clear-all"
                    (click)="clearHallSelection()"
                    [disabled]="selectedHallIds.length === 0">
                    <i class="pi pi-times-circle"></i>
                    {{ 'analytics.aiChat.clearAll' | translate }}
                  </button>
                </div>
              </div>

              <div class="hall-options">
                <div
                  class="hall-option"
                  *ngFor="let hall of availableHalls; trackBy: trackHall"
                  [class.selected]="selectedHallIds.includes(hall.id)"
                  [class.current-hall]="hall.id === currentHallId"
                  (click)="toggleHallSelection(hall.id)">
                  <div class="hall-checkbox">
                    <i
                      class="pi"
                      [ngClass]="
                        selectedHallIds.includes(hall.id)
                          ? 'pi-check-square'
                          : 'pi-square'
                      "></i>
                  </div>

                  <div class="hall-info">
                    <div class="hall-name">
                      {{ hall.name }}
                      <span
                        class="current-badge"
                        *ngIf="hall.id === currentHallId"
                        >Current</span
                      >
                    </div>
                    <div class="hall-id">ID: {{ hall.id }}</div>
                  </div>

                  <div
                    class="selection-indicator"
                    *ngIf="selectedHallIds.includes(hall.id)">
                    <i class="pi pi-check"></i>
                  </div>
                </div>
              </div>

              <div class="selector-footer">
                <div
                  class="context-indicator"
                  *ngIf="getEffectiveHallIds().length > 0">
                  <i class="pi pi-building"></i>
                  <span>{{ getContextDisplayText() }}</span>
                  <i
                    class="pi pi-star current-hall-star"
                    *ngIf="isUsingCurrentHall()"></i>
                </div>

                <div
                  class="current-hall-guarantee"
                  *ngIf="currentHallId && selectedHallIds.length === 0">
                  <i class="pi pi-shield"></i>
                  <span>{{
                    'analytics.aiChat.context.currentHallOnly' | translate
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-messages-container" #messagesContainer>
        <div class="chat-loading" *ngIf="isInitializing">
          <div class="loading-content">
            <i class="pi pi-spin pi-spinner"></i>
            <p>{{ 'analytics.aiChat.states.initializing' | translate }}</p>
          </div>
        </div>

        <div class="chat-messages" *ngIf="!isInitializing">
          <!--      <div class="sample-prompts" *ngIf="messages.length <= 1">-->
          <!--        <h3>{{ 'analytics.aiChat.prompts.title' | translate }}</h3>-->
          <!--        <div class="prompt-cards">-->
          <!--          <div-->
          <!--            class="prompt-card"-->
          <!--            *ngFor="let prompt of getSamplePrompts()"-->
          <!--            (click)="onSamplePromptClick(prompt)">-->
          <!--            <i class="pi pi-lightbulb"></i>-->
          <!--            <span>{{ prompt }}</span>-->
          <!--          </div>-->
          <!--        </div>-->
          <!--      </div>-->

          <div
            class="message-wrapper"
            *ngFor="let message of messages; trackBy: trackMessage">
            <div
              class="message user-message"
              *ngIf="message.type === 'user'"
              [@fadeInUp]>
              <div class="message-content">
                <div class="message-bubble">
                  <p>{{ message.message }}</p>
                  <div class="message-meta">
                    <span class="timestamp">{{
                      formatTime(message.timestamp)
                    }}</span>
                    <span
                      class="hall-context"
                      *ngIf="message.hallIds.length > 0">
                      <i class="pi pi-building"></i>
                      {{ message.hallIds.length }} halls
                    </span>
                  </div>
                </div>
              </div>
              <div class="message-avatar">
                <i class="pi pi-user"></i>
              </div>
            </div>

            <div
              class="message assistant-message"
              *ngIf="message.type === 'assistant'"
              [@fadeInUp]>
              <div class="message-avatar">
                <i class="pi pi-brain" *ngIf="!message.isLoading"></i>
                <i class="pi pi-spin pi-spinner" *ngIf="message.isLoading"></i>
              </div>
              <div class="message-content">
                <div
                  class="message-bubble"
                  [class.loading]="message.isLoading"
                  [class.error]="message.error">
                  <div class="loading-indicator" *ngIf="message.isLoading">
                    <div class="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <p>{{ message.message }}</p>
                  </div>

                  <div
                    class="error-content"
                    *ngIf="message.error && !message.isLoading">
                    <i class="pi pi-exclamation-triangle"></i>
                    <p>{{ message.message }}</p>
                    <button
                      class="retry-btn"
                      pButton
                      type="button"
                      size="small">
                      <i class="pi pi-refresh"></i>
                      {{ 'analytics.aiChat.states.retry' | translate }}
                    </button>
                  </div>

                  <div
                    class="normal-content"
                    *ngIf="!message.isLoading && !message.error">
                    <p>{{ message.message }}</p>

                    <div class="chart-container" *ngIf="message.chartUrl">
                      <div class="chart-header">
                        <i class="pi" [ngClass]="getVisualizationIcon()"></i>
                        <span>{{
                          'analytics.aiChat.chart.title' | translate
                        }}</span>
                      </div>
                      <div class="chart-iframe-wrapper">
                        <iframe
                          [src]="message.chartUrl"
                          frameborder="0"
                          class="chart-iframe">
                        </iframe>
                        <div class="chart-overlay">
                          <button
                            class="fullscreen-btn"
                            pButton
                            type="button"
                            size="small">
                            <i class="pi pi-external-link"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="message-meta">
                      <span class="timestamp">{{
                        formatTime(message.timestamp)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-container">
        <form [formGroup]="chatForm" (ngSubmit)="onSubmit()" class="chat-form">
          <div class="input-wrapper">
            <div class="context-indicator" *ngIf="getCurrentHallName()">
              <i class="pi pi-building"></i>
              <span>{{ getCurrentHallName() }}</span>
            </div>
            <div class="message-input-group">
              <textarea
                #messageInput
                formControlName="message"
                class="message-input"
                [placeholder]="'analytics.aiChat.placeholder' | translate"
                rows="1"
                (keydown)="onKeydown($event)"
                (input)="autoResizeTextarea($event)">
              </textarea>

              <button type="submit" class="send-btn" pButton>
                <i class="pi pi-send" *ngIf="!isLoading"></i>
                <i class="pi pi-spin pi-spinner" *ngIf="isLoading"></i>
              </button>
            </div>

            <div class="input-actions">
              <button
                type="button"
                class="action-btn"
                title="Attach Context"
                pButton>
                <i class="pi pi-paperclip"></i>
              </button>

              <button
                type="button"
                class="action-btn"
                title="Voice Input"
                pButton>
                <i class="pi pi-microphone"></i>
              </button>
            </div>
          </div>

          <div
            class="form-errors"
            *ngIf="
              chatForm.get('message')?.errors &&
              chatForm.get('message')?.touched
            ">
            <small
              class="error-text"
              *ngIf="chatForm.get('message')?.errors?.['required']">
              {{ 'analytics.aiChat.validation.required' | translate }}
            </small>
            <small
              class="error-text"
              *ngIf="chatForm.get('message')?.errors?.['minlength']">
              {{ 'analytics.aiChat.validation.minLength' | translate }}
            </small>
          </div>
        </form>

        <div class="quick-actions" *ngIf="!isLoading">
          <button
            class="quick-action"
            pButton
            type="button"
            size="small"
            (click)="onQuickAction('revenue')">
            <i class="pi pi-chart-bar"></i>
            {{ 'analytics.aiChat.quickActions.revenue' | translate }}
          </button>
          <button
            class="quick-action"
            pButton
            type="button"
            size="small"
            (click)="onQuickAction('bookings')">
            <i class="pi pi-calendar"></i>
            {{ 'analytics.aiChat.quickActions.bookings' | translate }}
          </button>
          <button
            class="quick-action"
            pButton
            type="button"
            size="small"
            (click)="onQuickAction('customers')">
            <i class="pi pi-users"></i>
            {{ 'analytics.aiChat.quickActions.customers' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../styles/chat-interface.component.scss'],
})
export class ChatInterfaceComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer', {static: false})
  messagesContainer!: ElementRef;
  @ViewChild('messageInput', {static: false}) messageInput!: ElementRef;

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
    private chatService: ChatService,
    private hallsService: HallsService,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    this.initializeChat();
    this.addWelcomeMessage();

    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateWelcomeMessage();
    });
  }

  private initializeChat(): void {
    this.isInitializing = true;

    const currentHall = this.hallsService.getCurrentHall();
    if (currentHall) {
      this.currentHallId = currentHall.id;
    }

    this.hallsService.halls$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (halls) => {
        this.availableHalls = halls.map((hall) => ({
          id: hall.id,
          name: hall.name,
        }));

        this.setInitialHallSelection();

        this.isInitializing = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.handleHallsLoadError();
        this.isInitializing = false;
        this.cdr.detectChanges();
      },
    });
  }

  private updateWelcomeMessage(): void {
    const welcomeIndex = this.messages.findIndex(
      (m) => m.type === 'assistant' && m.message.includes('👋'),
    );

    if (welcomeIndex !== -1) {
      this.messages[welcomeIndex].message = this.translate.instant(
        'analytics.aiChat.welcome',
      );
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

  private setInitialHallSelection(): void {
    if (this.currentHallId) {
      this.selectedHallIds = [this.currentHallId];

      const otherHalls = this.availableHalls.filter(
        (h) => h.id !== this.currentHallId,
      );
      if (otherHalls.length > 0) {
        this.selectedHallIds.push(otherHalls[0].id);
      }
    } else if (this.availableHalls.length > 0) {
      this.selectedHallIds = this.availableHalls.slice(0, 2).map((h) => h.id);
    }
  }

  private handleHallsLoadError(): void {
    if (this.currentHallId) {
      this.selectedHallIds = [this.currentHallId];
      this.availableHalls = [
        {id: this.currentHallId, name: `Current Hall (${this.currentHallId})`},
      ];
    } else {
      this.selectedHallIds = [];
      this.availableHalls = [];
      this.error =
        'Unable to load hall information. Some analytics features may be limited.';
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
      type: 'assistant',
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
      type: 'user',
    };

    this.messages.push(userMessage);

    const loadingMessage: ChatDisplayMessage = {
      id: this.generateMessageId(),
      message: this.translate.instant('analytics.aiChat.states.processing'),
      hallIds: effectiveHallIds,
      timestamp: new Date(),
      type: 'assistant',
      isLoading: true,
    };

    this.messages.push(loadingMessage);
    this.shouldScrollToBottom = true;
    this.cdr.detectChanges();

    this.chatForm.reset();
    this.isLoading = true;

    this.chatForm.get('message')?.disable();

    const request: AIChatRequest = {
      message: messageText,
      hallIds: effectiveHallIds,
    };

    this.chatService
      .sendMessage(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.handleChatResponse(response, loadingMessage);
        },
        error: (error) => {
          this.handleChatError(error, loadingMessage);
        },
      });
  }

  private handleChatResponse(
    response: AIChatResponse,
    loadingMessage: ChatDisplayMessage,
  ): void {
    const loadingIndex = this.messages.findIndex(
      (m) => m.id === loadingMessage.id,
    );
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

    this.chatForm.get('message')?.enable();

    this.cdr.detectChanges();

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 10);
  }

  private handleChatError(
    error: any,
    loadingMessage: ChatDisplayMessage,
  ): void {
    const loadingIndex = this.messages.findIndex(
      (m) => m.id === loadingMessage.id,
    );
    if (loadingIndex !== -1) {
      this.messages.splice(loadingIndex, 1);
    }

    const errorMessage: ChatDisplayMessage = {
      id: this.generateMessageId(),
      message: this.translate.instant('analytics.aiChat.states.error'),
      hallIds: this.getEffectiveHallIds(),
      timestamp: new Date(),
      type: 'assistant',
      error: 'Failed to generate visualization',
    };

    this.messages.push(errorMessage);
    this.shouldScrollToBottom = true;
    this.isLoading = false;

    this.chatForm.get('message')?.enable();

    this.cdr.detectChanges();
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
    }
  }

  private generateMessageId(): string {
    return `msg_${++this.messageIdCounter}_${Date.now()}`;
  }

  formatTime(timestamp: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(timestamp);
  }

  getVisualizationIcon(type?: string): string {
    const iconMap: {[key: string]: string} = {
      'bar': 'pi-chart-bar',
      'line': 'pi-chart-line',
      'pie': 'pi-chart-pie',
      'table': 'pi-table',
      'metric': 'pi-calculator',
      'scatter': 'pi-circle',
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
    this.selectedHallIds = this.availableHalls.map((hall) => hall.id);
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
      return this.translate.instant('analytics.aiChat.context.withCurrent', {
        count: 1,
      });
    }
    return this.translate.instant('analytics.aiChat.context.indicator', {
      count: 0,
    });
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

    this.chatForm.patchValue({message});
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

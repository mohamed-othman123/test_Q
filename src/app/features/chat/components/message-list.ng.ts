import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {HallsService} from '@halls/services/halls.service';
import {ChatDisplayMessage} from '../models/chat.types';

@Component({
  selector: 'app-message-list',
  standalone: false,
  template: `
    <div class="messages-container" #messagesContainer>
      <div class="messages-list">
        <div
          class="welcome-message"
          *ngIf="messages.length === 0 && !isLoading">
          <div class="welcome-content">
            <div class="welcome-icon">
              <i class="pi pi-sparkles"></i>
            </div>
            <h3>{{ 'chat.welcomeTitle' | translate }}</h3>
            <p>{{ 'chat.welcomeMessage' | translate }}</p>

            <div class="quick-suggestions">
              <button
                class="suggestion-chip"
                (click)="
                  onQuickMessage(getTranslatedMessage('chat.quickMessage1'))
                ">
                <i class="pi pi-calendar"></i>
                {{ 'chat.quickMessage1' | translate }}
              </button>
              <button
                class="suggestion-chip"
                (click)="
                  onQuickMessage(getTranslatedMessage('chat.quickMessage2'))
                ">
                <i class="pi pi-megaphone"></i>
                {{ 'chat.quickMessage2' | translate }}
              </button>
              <button
                class="suggestion-chip"
                (click)="
                  onQuickMessage(getTranslatedMessage('chat.quickMessage3'))
                ">
                <i class="pi pi-heart"></i>
                {{ 'chat.quickMessage3' | translate }}
              </button>
            </div>
          </div>
        </div>

        <div
          class="message"
          *ngFor="let message of messages; trackBy: trackMessage"
          [class.user-message]="message.type === 'user'"
          [class.ai-message]="message.type === 'assistant'"
          [class.streaming]="message.isStreaming">
          <div class="message-avatar">
            <div
              class="avatar"
              [class.user-avatar]="message.type === 'user'"
              [class.ai-avatar]="message.type === 'assistant'">
              <img
                *ngIf="
                  message.type === 'user' && getCurrentHallIcon();
                  else defaultIcon
                "
                [src]="getCurrentHallIcon()"
                [alt]="'User avatar'"
                class="hall-icon" />
              <ng-template #defaultIcon>
                <i
                  class="pi"
                  [class.pi-user]="message.type === 'user'"
                  [class.pi-sparkles]="message.type === 'assistant'"></i>
              </ng-template>
            </div>
          </div>

          <div class="message-content">
            <div class="message-header">
              <span class="message-role">{{
                message.type === 'user'
                  ? ('chat.you' | translate)
                  : ('chat.aiAssistant' | translate)
              }}</span>
              <span class="message-time">{{
                formatTime(message.timestamp)
              }}</span>
            </div>

            <div
              class="message-text"
              [innerHTML]="formatMessage(message.message)"></div>

            <div
              class="message-actions"
              *ngIf="!message.isStreaming">
              <button
                class="action-btn copy-btn"
                (click)="copyMessage(message.message)"
                title="Copy message">
                <i class="pi pi-copy"></i>
              </button>
              <button class="action-btn like-btn" title="Like message">
                <i class="pi pi-thumbs-up"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="loading-message" *ngIf="isLoading">
          <div class="message-avatar">
            <div class="avatar ai-avatar">
              <i class="pi pi-sparkles"></i>
            </div>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span class="typing-text">
                {{ 'chat.aiThinking' | translate }}
              </span>
            </div>
          </div>
        </div>

        <!-- Conversation loading indicator -->
        <div class="conversation-loading" *ngIf="isLoadingConversation">
          <div class="loading-content">
            <div class="loading-spinner">
              <i class="pi pi-spin pi-spinner"></i>
            </div>
            <p>{{ 'chat.loadingMessages' | translate }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .messages-container {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 1rem 0;
        scroll-behavior: smooth;
        height: 100%;
        position: relative;
      }

      .messages-list {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 1.5rem;
        min-height: 100%;
        display: flex;
        flex-direction: column;
      }

      .welcome-message {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        padding: 2rem;
        flex: 1;
      }

      .welcome-content {
        text-align: center;
        max-width: 500px;
      }

      .welcome-icon {
        width: 60px;
        height: 60px;
        background: linear-gradient(
          135deg,
          var(--primary-color),
          var(--secondary-color)
        );
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        color: white;
        font-size: 1.5rem;
      }

      .welcome-content h3 {
        margin: 0 0 0.5rem;
        color: var(--text-primary);
        font-size: 1.5rem;
      }

      .welcome-content p {
        margin: 0 0 2rem;
        color: var(--text-secondary);
        font-size: 1rem;
        line-height: 1.6;
      }

      .quick-suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        justify-content: center;
      }

      .suggestion-chip {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: var(--bg-elevated);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--text-primary);
        font-size: 0.875rem;
      }

      .suggestion-chip:hover {
        background: var(--primary-light);
        border-color: var(--primary-color);
        transform: translateY(-1px);
      }

      .message {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        animation: messageSlideIn 0.3s ease-out;
      }

      .message-avatar {
        flex-shrink: 0;
      }

      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.875rem;
      }

      .user-avatar {
        background: var(--primary-color);
      }

      .ai-avatar {
        background: linear-gradient(
          135deg,
          var(--secondary-color),
          var(--accent-color)
        );
        /* Ensure icon is visible in both light and dark modes */
        color: white !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        border: 2px solid rgba(255, 255, 255, 0.2);
        position: relative;
      }

      .ai-avatar i {
        color: white !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        font-weight: bold;
      }

      .hall-icon {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      .message-content {
        flex: 1;
        min-width: 0;
      }

      .message-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .message-role {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.875rem;
      }

      .message-time {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }

      .message-text {
        color: var(--text-primary);
        line-height: 1.6;
        word-wrap: break-word;
        white-space: pre-wrap;
      }

      .message-actions {
        display: flex;
        gap: 0.25rem;
        margin-top: 0.75rem;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .message:hover .message-actions {
        opacity: 1;
      }

      .action-btn {
        width: 28px;
        height: 28px;
        background: transparent;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--text-secondary);
        font-size: 0.75rem;
      }

      .action-btn:hover {
        background: var(--bg-hover);
        color: var(--primary-color);
      }

      .loading-message {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 0;
      }

      .typing-dots {
        display: flex;
        gap: 0.25rem;
      }

      .typing-dots span {
        width: 6px;
        height: 6px;
        background: var(--primary-color);
        border-radius: 50%;
        animation: typingBounce 1.4s infinite ease-in-out;
      }

      .typing-dots span:nth-child(1) {
        animation-delay: -0.32s;
      }
      .typing-dots span:nth-child(2) {
        animation-delay: -0.16s;
      }

      .typing-text {
        color: var(--text-secondary);
        font-size: 0.875rem;
        font-style: italic;
      }

      /* Conversation loading indicator */
      .conversation-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        padding: 2rem;
      }

      .loading-content {
        text-align: center;
      }

      .loading-spinner {
        width: 48px;
        height: 48px;
        margin: 0 auto 1rem;
        color: var(--primary-color);
        font-size: 2rem;
      }

      .loading-content p {
        color: var(--text-secondary);
        font-size: 1rem;
        margin: 0;
      }

      @keyframes messageSlideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes typingBounce {
        0%,
        80%,
        100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }

      @media (max-width: 768px) {
        .messages-list {
          padding: 0 1rem;
        }

        .message {
          gap: 0.75rem;
        }

        .avatar {
          width: 32px;
          height: 32px;
        }

        .quick-suggestions {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class MessageListComponent implements AfterViewChecked, OnChanges {
  @ViewChild('messagesContainer', {static: false})
  messagesContainer!: ElementRef<HTMLDivElement>;

  @Input() messages: ChatDisplayMessage[] = [];
  @Input() isLoading = false;
  @Input() isLoadingConversation = false;

  @Output() quickMessage = new EventEmitter<string>();

  private shouldScrollToBottom = false;
  private previousMessageCount = 0;
  private translateService = inject(TranslateService);
  private hallsService = inject(HallsService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages'] && !changes['messages'].firstChange) {
      const currentCount = this.messages.length;
      if (currentCount > this.previousMessageCount) {
        this.shouldScrollToBottom = true;
        this.previousMessageCount = currentCount;
      }
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  onQuickMessage(message: string): void {
    this.quickMessage.emit(message);
  }

  getTranslatedMessage(key: string): string {
    return this.translateService.instant(key);
  }

  trackMessage(index: number, message: ChatDisplayMessage): string {
    return message.id || `${index}-${message.timestamp}`;
  }

  formatTime(timestamp: Date | string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  }

  formatMessage(message: string): string {
    return message.replace(/\n/g, '<br>');
  }

  getCurrentHallIcon(): string | null {
    const currentHall = this.hallsService.getCurrentHall();
    return currentHall?.logo_url || null;
  }

  copyMessage(message: string): void {
    navigator.clipboard.writeText(message).then(() => {
      this.showCopyNotification();
    });
  }

  private showCopyNotification(): void {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = this.translateService.instant('chat.messageCopied');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: black;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer?.nativeElement;
      if (container) {
        requestAnimationFrame(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          });
        });
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}

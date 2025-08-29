import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatDisplayMessage } from '../models/chat.types';

@Component({
  selector: 'app-message-list',
  standalone: false,
  template: `
    <div class="messages-container" #messagesContainer>
      <div class="messages-list">
        <div class="welcome-message" *ngIf="messages.length === 0 && !isLoading">
          <div class="welcome-content">
            <div class="welcome-icon">
              <i class="pi pi-sparkles"></i>
            </div>
            <h3>Welcome to AI Assistant</h3>
            <p>Ask me anything! I'm here to help with your questions and tasks.</p>

            <div class="quick-suggestions">
              <button class="suggestion-chip" (click)="onQuickMessage('Explain quantum computing')">
                <i class="pi pi-lightbulb"></i>
                Explain quantum computing
              </button>
              <button class="suggestion-chip" (click)="onQuickMessage('Write a Python function')">
                <i class="pi pi-code"></i>
                Write a Python function
              </button>
              <button class="suggestion-chip" (click)="onQuickMessage('Help me brainstorm ideas')">
                <i class="pi pi-bolt"></i>
                Help me brainstorm ideas
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
            <div class="avatar" [class.user-avatar]="message.type === 'user'" [class.ai-avatar]="message.type === 'assistant'">
              <i class="pi" [class.pi-user]="message.type === 'user'" [class.pi-sparkles]="message.type === 'assistant'"></i>
            </div>
          </div>

          <div class="message-content">
            <div class="message-header">
              <span class="message-role">{{ message.type === 'user' ? 'You' : 'AI Assistant' }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>

            <div class="message-text" [innerHTML]="formatMessage(message.message)"></div>

            <div class="message-actions" *ngIf="message.type === 'assistant' && !message.isStreaming">
              <button class="action-btn copy-btn" (click)="copyMessage(message.message)" title="Copy message">
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
              <span class="typing-text">AI is thinking...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
      scroll-behavior: smooth;
    }

    .messages-list {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    .welcome-message {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      padding: 2rem;
    }

    .welcome-content {
      text-align: center;
      max-width: 500px;
    }

    .welcome-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
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
      background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
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

    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

    .typing-text {
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-style: italic;
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
      0%, 80%, 100% {
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
  `]
})
export class MessageListComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  @Input() messages: ChatDisplayMessage[] = [];
  @Input() isLoading = false;

  @Output() quickMessage = new EventEmitter<string>();

  private shouldScrollToBottom = false;

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  onQuickMessage(message: string): void {
    this.quickMessage.emit(message);
  }

  trackMessage(index: number, message: ChatDisplayMessage): string {
    return message.id || `${index}-${message.timestamp}`;
  }

  formatTime(timestamp: Date | string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatMessage(message: string): string {
    return message.replace(/\n/g, '<br>');
  }

  copyMessage(message: string): void {
    navigator.clipboard.writeText(message).then(() => {
      console.log('Message copied to clipboard');
    });
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}

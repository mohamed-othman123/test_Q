import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: false,
  template: `
    <div class="input-container">
      <form class="message-form" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="input-wrapper">
          <textarea
            #messageInput
            class="message-input"
            formControlName="message"
            [placeholder]="'chat.messagePlaceholder' | translate"
            rows="1"
            (keydown)="onKeyDown($event)"
            (input)="onInput($event)">
          </textarea>

          <div class="input-actions">
            <!-- TODO: Re-enable attach file functionality when needed -->
            <!-- <button
              type="button"
              class="attach-btn"
              [title]="'chat.attachFile' | translate">
              <i class="pi pi-paperclip"></i>
            </button> -->

            <button
              type="submit"
              class="send-btn"
              [title]="getSubmitButtonTitle()">
              <i class="pi" [class.pi-send]="!isLoading" [class.pi-spin]="isLoading" [class.pi-spinner]="isLoading"></i>
            </button>
          </div>
        </div>

        <div class="input-footer">
          <div class="input-info">
            <span class="char-count" [class.warning]="getCharCount() > 1800" [class.error]="getCharCount() > 2000">
              {{ getCharCount() }}/2000
            </span>
            <span class="shortcuts">{{ 'chat.pressEnterToSend' | translate }}</span>
          </div>

          <div class="quick-actions" *ngIf="showQuickActions">
            <button
              type="button"
              class="quick-action"
              (click)="quickMessage.emit('Summarize this for me')">
              <i class="pi pi-file-text"></i>
              {{ 'chat.summarize' | translate }}
            </button>
            <button
              type="button"
              class="quick-action"
              (click)="quickMessage.emit('Explain this step by step')">
              <i class="pi pi-list"></i>
              {{ 'chat.explain' | translate }}
            </button>
            <button
              type="button"
              class="quick-action"
              (click)="quickMessage.emit('Help me improve this')">
              <i class="pi pi-wrench"></i>
              {{ 'chat.improve' | translate }}
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .input-container {
      background: var(--bg-surface);
      border-top: 1px solid var(--border-color);
      padding: 1rem 1.5rem;
      position: sticky;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 8 !important;
      backdrop-filter: blur(10px);
      background: var(--bg-surface-alpha);
      flex-shrink: 0;
      min-height: 80px;
      margin-top: auto;
    }

    .message-form {
      max-width: 800px;
      margin: 0 auto;
    }

    .input-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
      background: var(--bg-elevated);
      border: 2px solid var(--border-color);
      border-radius: 16px;
      padding: 0.75rem 1rem;
      transition: all 0.2s ease;
    }

    .input-wrapper:focus-within {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-light);
    }

    .message-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      resize: none;
      font-family: inherit;
      font-size: 1rem;
      line-height: 1.5;
      color: var(--text-primary);
      max-height: 120px;
      min-height: 24px;
    }

    .message-input::placeholder {
      color: var(--text-secondary);
    }

    .message-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .input-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .attach-btn {
      width: 32px;
      height: 32px;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--text-secondary);
    }

    .attach-btn:hover:not(:disabled) {
      background: var(--bg-hover);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .attach-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .send-btn {
      width: 36px;
      height: 36px;
      background: var(--primary-color);
      border: none;
      border-radius: 10px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .send-btn:hover:not(:disabled) {
      transform: scale(1.05);
    }

    .send-btn:disabled {
      background: var(--bg-disabled);
      color: var(--text-disabled);
      cursor: not-allowed;
      transform: none;
    }

    .input-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-light);
      min-height: 2rem; 
    }

    .input-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
      flex: 1; 
    }

    .char-count.warning {
      color: var(--warning-color);
      font-weight: 600;
    }

    .char-count.error {
      color: var(--error-color);
      font-weight: 600;
    }

    .quick-actions {
      display: flex;
      gap: 0.5rem;
    }

    .quick-action {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.75rem;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-secondary);
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .quick-action:hover:not(:disabled) {
      background: var(--bg-hover);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .quick-action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .input-container {
        padding: 1rem;
      }

      .input-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
      }

      .quick-actions {
        justify-content: center;
      }

      .shortcuts {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .quick-actions {
        display: none;
      }
    }
  `]
})
export class MessageInputComponent {
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef<HTMLTextAreaElement>;

  @Input() form!: FormGroup;
  @Input() canSend = false;
  @Input() isLoading = false;
  @Input() showQuickActions = true;

  @Output() send = new EventEmitter<string>();
  @Output() quickMessage = new EventEmitter<string>();

  onSubmit(): void {
    if (!this.canSend || this.isLoading) return;

    const message = this.form.get('message')?.value?.trim();
    if (!message) return;

    this.send.emit(message);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.onSubmit();
    }

    if (event.key === 'Escape') {
      this.form.get('message')?.setValue('');
      this.adjustTextareaHeight();
    }
  }

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;
    
    if (value.length > 2000) {
      textarea.value = value.substring(0, 2000);
      this.form.get('message')?.setValue(textarea.value);
    }
    
    this.adjustTextareaHeight();
  }

  adjustTextareaHeight(): void {
    const textarea = this.messageInput?.nativeElement;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  getCharCount(): number {
    return this.form.get('message')?.value?.length || 0;
  }

  getSubmitButtonTitle(): string {
    if (this.isLoading) return 'Sending...';
    if (!this.canSend) return 'Type a message to send';
    return 'Send message (Ctrl+Enter)';
  }
}

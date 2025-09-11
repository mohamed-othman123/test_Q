import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-chat-header',
  standalone: false,
  template: `
    <div class="chat-header">
      <div class="header-left">
        <div class="chat-info">
          <h1 class="chat-title">{{ title }}</h1>
          <p class="chat-subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <div class="header-actions">
        <button
          class="action-btn theme-toggle"
          (click)="themeChange.emit()"
          [title]="theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <i class="pi" [class.pi-sun]="theme === 'dark'" [class.pi-moon]="theme === 'light'"></i>
        </button>

      </div>
    </div>
  `,
  styles: [`
    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 10;
      backdrop-filter: blur(10px);
      background: var(--bg-surface-alpha);
    }

    .header-left {
      flex: 1;
      min-width: 0;
    }

    .chat-info {
      max-width: 100%;
    }

    .chat-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chat-subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.875rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .action-btn {
      position: relative;
      width: 40px;
      height: 40px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--text-secondary);
    }

    .action-btn:hover {
      background: var(--bg-hover);
      border-color: var(--primary-color);
      color: var(--primary-color);
      transform: translateY(-1px);
    }

    .theme-toggle:hover {
      color: var(--warning-color);
      border-color: var(--warning-color);
    }


    @media (max-width: 768px) {
      .chat-header {
        padding: 1rem;
      }

      .chat-title {
        font-size: 1.125rem;
      }

      .chat-subtitle {
        font-size: 0.8125rem;
      }

      .action-btn {
        width: 36px;
        height: 36px;
      }
    }
  `]
})
export class ChatHeaderComponent {
  @Input() title = 'AI Assistant';
  @Input() subtitle = 'Powered by advanced AI';
  @Input() theme: 'light' | 'dark' = 'dark';
  @Input() sidebarCollapsed = false;
  @Input() conversationCount = 0;

  @Output() themeChange = new EventEmitter<void>();
}

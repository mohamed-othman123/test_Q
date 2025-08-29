import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LanguageService } from '@core/services/language.service';
import { Conversation } from '../models/chat.types';

@Component({
  selector: 'app-conversations-sidebar',
  standalone: false,
  template: `
    <aside
      class="conversations-sidebar"
      [class.collapsed]="collapsed"
      [class.rtl]="isRTL">

      <div class="sidebar-header">
        <button
          class="toggle-btn"
          (click)="toggle.emit()"
          [title]="collapsed ? 'Expand Conversations' : 'Hide Conversations'">
          <i class="pi" 
             [class.pi-chevron-left]="(!collapsed && isRTL) || (collapsed && !isRTL)" 
             [class.pi-chevron-right]="(!collapsed && !isRTL) || (collapsed && isRTL)"></i>
        </button>

        <div class="sidebar-title" *ngIf="!collapsed">
          <i class="pi pi-comments"></i>
          <span>{{ 'chat.conversations' | translate }}</span>
        </div>

        <button
          class="new-chat-btn"
          (click)="newChat.emit()"
          *ngIf="!collapsed"
          [title]="'chat.newChat' | translate">
          <i class="pi pi-plus"></i>
        </button>
      </div>

      <div class="conversations-content" *ngIf="!collapsed">
        <div class="conversations-actions">
          <button
            class="refresh-btn"
            (click)="loadConversations.emit()"
            [class.loading]="isLoading">
            <i class="pi pi-refresh" [class.pi-spin]="isLoading"></i>
            <span>{{ 'chat.refresh' | translate }}</span>
          </button>
        </div>

        <div class="conversations-list">
          <div
            class="conversation-item"
            *ngFor="let conv of conversations; trackBy: trackConversation"
            [class.active]="currentConversationId === conv.id"
            (click)="selectConversation.emit(conv.id)">

            <div class="conversation-preview">
              <div class="conversation-topic">
                {{ conv.topic || ('chat.generalChat' | translate) }}
              </div>
              <div class="conversation-time">
                {{ formatTime(conv.lastMessageAt) }}
              </div>
            </div>

            <div class="conversation-status">
              <i class="pi pi-circle-fill"
                 *ngIf="isRecentActivity(conv.lastMessageAt)">
              </i>
            </div>
          </div>
        </div>

        <div class="conversations-empty" *ngIf="conversations.length === 0 && !isLoading">
          <i class="pi pi-comment"></i>
          <p>{{ 'chat.noConversationsYet' | translate }}</p>
          <small>{{ 'chat.startNewChatToBegin' | translate }}</small>
        </div>

        <div class="conversations-loading" *ngIf="isLoading">
          <i class="pi pi-spin pi-spinner"></i>
          <span>{{ 'chat.loadingConversations' | translate }}</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .conversations-sidebar {
      position: absolute;
      top: 0;
      width: 320px;
      height: 100%;
      background: var(--bg-surface);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease, transform 0.3s ease;
      z-index: 10;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    }

    /* RTL positioning */
    .conversations-sidebar.rtl {
      left: 0;
      border-right: 1px solid var(--border-color);
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    }

    /* LTR positioning */
    .conversations-sidebar:not(.rtl) {
      right: 0;
      border-left: 1px solid var(--border-color);
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    }

    .conversations-sidebar.collapsed {
      width: 60px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
      gap: 0.75rem;
      min-height: 82px;
    }

    .toggle-btn {
      width: 36px;
      height: 36px;
      border: 1px solid var(--border-color);
      background: var(--bg-elevated);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .toggle-btn:hover {
      background: var(--bg-hover);
      border-color: var(--primary-color);
    }

    .sidebar-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: var(--text-primary);
      flex: 1;
    }

    .new-chat-btn {
      width: 36px;
      height: 36px;
      background: #667eea;
      border: none;
      border-radius: 8px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 1rem;
    }

    .new-chat-btn:hover {
      background: #5a6fd8;
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .new-chat-btn i {
      color: white !important;
      font-weight: bold;
    }

    .conversations-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .conversations-actions {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .refresh-btn {
      width: 100%;
      height: 36px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    .refresh-btn:hover {
      background: var(--bg-hover);
    }

    .refresh-btn.loading {
      opacity: 0.7;
      pointer-events: none;
    }

    .conversations-list {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .conversation-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      margin-bottom: 0.25rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .conversation-item:hover {
      background: var(--bg-hover);
    }

    .conversation-item.active {
      background: var(--primary-light);
      border-color: var(--primary-color);
    }

    .conversation-preview {
      flex: 1;
      min-width: 0;
    }

    .conversation-topic {
      font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 0.25rem;
    }

    .conversation-time {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .conversation-status {
      margin-left: 0.5rem;
    }

    .conversation-status i {
      color: var(--success-color);
      font-size: 0.5rem;
    }

    .conversations-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
    }

    .conversations-empty i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      opacity: 0.5;
    }

    .conversations-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 2rem;
      color: var(--text-secondary);
    }
  `]
})
export class ConversationsSidebarComponent {
  @Input() collapsed = false;
  @Input() conversations: Conversation[] = [];
  @Input() currentConversationId: number | null = null;
  @Input() isLoading = false;

  @Output() toggle = new EventEmitter<void>();
  @Output() newChat = new EventEmitter<void>();
  @Output() selectConversation = new EventEmitter<number>();
  @Output() loadConversations = new EventEmitter<void>();

  constructor(private languageService: LanguageService) {}

  get isRTL(): boolean {
    return this.languageService.getCurrentLanguage() === 'ar';
  }

  trackConversation(index: number, conversation: Conversation): number {
    return conversation.id;
  }

  formatTime(timestamp: string | Date): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  isRecentActivity(timestamp: string | Date): boolean {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return diffMs < (1000 * 60 * 60 * 2);
  }
}

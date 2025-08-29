import {
    Component,
    OnInit,
    OnDestroy,
    signal,
    computed,
    effect,
    inject
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AiChatService } from '../services/chat.service';
import { HallsService } from '@halls/services/halls.service';
import { ChatDisplayMessage, Conversation } from '../models/chat.types';
import { Hall } from '@halls/models/halls.model';

@Component({
    selector: 'app-magical-chat',
    standalone: false,
    template: `
        <div
                class="magical-chat-container"
                [attr.data-theme]="theme()"
                [class.sidebar-collapsed]="sidebarCollapsed()">

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
                        [messages]="messages()"
                        [isLoading]="isLoading()"
                        (quickMessage)="sendQuickMessage($event)">
                </app-message-list>

                <app-message-input
                        [form]="chatForm"
                        [canSend]="canSendMessage()"
                        [isLoading]="isLoading()"
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
    styleUrls: ['./magical-chat.component.scss']
})
export class MagicalChatComponent implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private aiChatService = inject(AiChatService);
    private hallsService = inject(HallsService);
    private destroy$ = new Subject<void>();

    chatForm: FormGroup = this.fb.group({
        message: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(2000)]]
    });

    sidebarCollapsed = signal(false);
    theme = signal<'light' | 'dark'>('dark');
    isLoading = signal(false);
    currentConversationId = signal<number | null>(null);
    messages = signal<ChatDisplayMessage[]>([]);
    connectionStatus = signal<'connected' | 'connecting' | 'disconnected'>('connected');
    currentHall = signal<Hall | null>(null);

    conversations = computed(() => this.aiChatService.conversations());
    isLoadingConversations = computed(() => this.aiChatService.isLoadingConversations());

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

    private retryLoadConversations(): void {
        let retryCount = 0;
        const maxRetries = 3;

        const tryLoad = () => {
            const hall = this.hallsService.getCurrentHall();
            if (hall?.id) {
                this.currentHall.set(hall);
                return;
            }

            retryCount++;
            if (retryCount < maxRetries) {
                setTimeout(tryLoad, 200 * retryCount);
            }
        };

        tryLoad();
    }

    getCurrentConversationTitle = computed(() => {
        const currentId = this.currentConversationId();
        if (!currentId) return 'New Chat';
        const conversation = this.conversations().find(c => c.id === currentId);
        return conversation?.topic || 'AI Chat';
    });

    getSubtitleText = computed(() => {
        const currentId = this.currentConversationId();
        const messageCount = this.messages().length;
        const hasStreaming = this.messages().some(m => m.isStreaming);
        const status = this.connectionStatus();

        if (hasStreaming) return 'AI is responding...';
        if (status !== 'connected') return `Status: ${status}`;
        if (!currentId) return 'Start a new conversation with AI assistant';
        if (messageCount === 0) return 'Powered by advanced AI • Real-time responses';

        const exchanges = Math.floor(messageCount / 2);
        return `${exchanges} exchange${exchanges !== 1 ? 's' : ''} • Connected`;
    });

    canSendMessage = computed(() => {
        const formValid = this.chatForm.valid;
        const notLoading = !this.isLoading();
        const hasContent = this.chatForm.get('message')?.value?.trim().length > 0;
        const isConnected = this.connectionStatus() === 'connected';
        return formValid && notLoading && hasContent && isConnected;
    });

    ngOnInit(): void {
        this.loadUserPreferences();

        const initialHall = this.hallsService.getCurrentHall();
        if (initialHall) {
            this.currentHall.set(initialHall);
        } else {
            this.retryLoadConversations();
        }

        this.hallsService.currentHall$
            .pipe(takeUntil(this.destroy$))
            .subscribe(hall => {
                if (hall) {
                    this.currentHall.set(hall);
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadUserPreferences(): void {
        const savedTheme = localStorage.getItem('ai-chat-theme') as 'light' | 'dark';
        if (savedTheme) this.theme.set(savedTheme);

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
        this.aiChatService.loadMessages(conversationId);

        if (window.innerWidth <= 768) {
            this.sidebarCollapsed.set(true);
        }
    }

    startNewConversation(): void {
        this.currentConversationId.set(null);
        this.messages.set([]);
        this.chatForm.reset();
        this.aiChatService.clearMessages();
    }

    sendMessage(messageText: string): void {
        if (!this.canSendMessage()) return;

        this.isLoading.set(true);

        setTimeout(() => {
            this.isLoading.set(false);
            this.chatForm.reset();
        }, 2000);
    }

    sendQuickMessage(message: string): void {
        this.chatForm.patchValue({ message });
        this.sendMessage(message);
    }
}

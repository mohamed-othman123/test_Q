import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Animation module
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Translation
import { TranslateModule } from '@ngx-translate/core';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';

// Components and Services
import { MagicalChatComponent } from './pages/magical-chat.component';
import { SharedModule } from '@shared/shared.module';
import { AiChatService } from './services/chat.service';
import {ConversationsSidebarComponent} from './components/conversations-sidebar.ng';
import {ChatHeaderComponent} from './components/chat-header.ng';
import {MessageListComponent} from './components/message-list.ng';
import {MessageInputComponent} from './components/message-input.ng';

const routes = [
  {
    path: '',
    component: MagicalChatComponent,
    data: { title: 'AI Assistant' }
  }
];

@NgModule({
  declarations: [    MagicalChatComponent,
    ConversationsSidebarComponent,
    ChatHeaderComponent,
    MessageListComponent,
    MessageInputComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

    TranslateModule,

    SharedModule,

    ButtonModule,
    InputTextareaModule,
    TooltipModule,
    RippleModule,
    SkeletonModule,
    ToastModule,
    ScrollPanelModule,
    MenuModule,
    OverlayPanelModule,
  ],
  providers: [AiChatService],
})
export class MagicalChatModule {}

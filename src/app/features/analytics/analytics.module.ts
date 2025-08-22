import {NgModule} from '@angular/core';
import {CommonModule, NgForOf, NgIf} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule, TranslatePipe} from '@ngx-translate/core';
import {ButtonModule} from 'primeng/button';
import {SkeletonModule} from 'primeng/skeleton';
import {RippleModule} from 'primeng/ripple';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {TooltipModule} from 'primeng/tooltip';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {ChipModule} from 'primeng/chip';
import {TagModule} from 'primeng/tag';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AnalyticsOverviewComponent} from './components/analytics-overview/analytics-overview.component';
import {DashboardListComponent} from './components/dashboard-list/dashboard-list.component';
import {DashboardViewerComponent} from './components/dashboard-viewer/dashboard-viewer.component';
import {QuestionViewerComponent} from './components/question-viewer/question-viewer.component';
import {AiChatComponent} from './components/ai-chat/ai-chat.component';

import {AnalyticsRoutingModule} from './analytics-routing.module';
import {SharedModule} from '@shared/shared.module';

@NgModule({
  declarations: [
    AnalyticsOverviewComponent,
    DashboardListComponent,
    DashboardViewerComponent,
    QuestionViewerComponent,
    AiChatComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    SkeletonModule,
    RippleModule,
    ProgressSpinnerModule,
    InputTextareaModule,
    TooltipModule,
    OverlayPanelModule,
    ChipModule,
    TagModule,
    AnalyticsRoutingModule,
    TranslatePipe,
    SharedModule,
  ],
  providers: [],
})
export class AnalyticsModule {}

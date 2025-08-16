import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { RippleModule } from 'primeng/ripple';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { AnalyticsOverviewComponent } from './components/analytics-overview/analytics-overview.component';
import { DashboardListComponent } from './components/dashboard-list/dashboard-list.component';
import { DashboardViewerComponent } from './components/dashboard-viewer/dashboard-viewer.component';
import { QuestionViewerComponent } from './components/question-viewer/question-viewer.component';

import { AnalyticsRoutingModule } from './analytics-routing.module';

@NgModule({
  declarations: [
    AnalyticsOverviewComponent,
    DashboardListComponent,
    DashboardViewerComponent,
    QuestionViewerComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,

    ButtonModule,
    SkeletonModule,
    RippleModule,
    ProgressSpinnerModule,

    AnalyticsRoutingModule
  ],
  providers: []
})
export class AnalyticsModule { }

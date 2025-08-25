import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {ButtonModule} from 'primeng/button';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {ChipModule} from 'primeng/chip';
import {AnalyticsOverviewComponent} from './components/analytics-overview/analytics-overview.component';
import {DashboardListComponent} from './components/dashboard-list/dashboard-list.component';
import {DashboardViewerComponent} from './components/dashboard-viewer/dashboard-viewer.component';
import {QuestionViewerComponent} from './components/question-viewer/question-viewer.component';

import {AnalyticsRoutingModule} from './analytics-routing.module';
import {SharedModule} from '@shared/shared.module';

@NgModule({
  declarations: [
    AnalyticsOverviewComponent,
    DashboardListComponent,
    DashboardViewerComponent,
    QuestionViewerComponent,
  ],
  imports: [
    RouterModule,
    ButtonModule,
    InputTextareaModule,
    ChipModule,
    AnalyticsRoutingModule,
    TranslatePipe,
    SharedModule,
  ],
  providers: [],
})
export class AnalyticsModule {}

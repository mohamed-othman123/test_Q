import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsOverviewComponent } from './components/analytics-overview/analytics-overview.component';
import { DashboardListComponent } from './components/dashboard-list/dashboard-list.component';
import { DashboardViewerComponent } from './components/dashboard-viewer/dashboard-viewer.component';
import { QuestionViewerComponent } from './components/question-viewer/question-viewer.component';
import {AiChatComponent} from './components/ai-chat/ai-chat.component';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsOverviewComponent,
    data: { title: 'pageTitles.analytics' }
  },
  {
    path: 'dashboards',
    component: DashboardListComponent,
    data: { title: 'pageTitles.dashboards' }
  },
  {
    path: 'dashboard/:id',
    component: DashboardViewerComponent,
    data: { title: 'pageTitles.analyticsDashboard' }
  },
  {
    path: 'question/:id',
    component: QuestionViewerComponent,
    data: { title: 'pageTitles.analyticsQuestion' }
  },
  {
    path: 'ai-chat',
    component: AiChatComponent,
    data: { title: 'pageTitles.aiChat' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule { }

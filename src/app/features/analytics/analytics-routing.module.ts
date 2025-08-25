import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsOverviewComponent } from './components/analytics-overview/analytics-overview.component';
import { DashboardListComponent } from './components/dashboard-list/dashboard-list.component';
import { DashboardViewerComponent } from './components/dashboard-viewer/dashboard-viewer.component';
import { QuestionViewerComponent } from './components/question-viewer/question-viewer.component';
import {AnalyticsGuard} from '@core/guards/analytics.guard';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsOverviewComponent,
    canActivate: [AnalyticsGuard],
    data: { title: 'pageTitles.analytics' }
  },
  {
    path: 'dashboards',
    component: DashboardListComponent,
    canActivate: [AnalyticsGuard],
    data: { title: 'pageTitles.dashboards' }
  },
  {
    path: 'dashboard/:id',
    component: DashboardViewerComponent,
    canActivate: [AnalyticsGuard],
    data: { title: 'pageTitles.analyticsDashboard' }
  },
  {
    path: 'question/:id',
    component: QuestionViewerComponent,
    canActivate: [AnalyticsGuard],
    data: { title: 'pageTitles.analyticsQuestion' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule { }

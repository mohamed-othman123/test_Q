import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsOverviewComponent } from './components/analytics-overview/analytics-overview.component';
import { DashboardViewerComponent } from './components/dashboard-viewer/dashboard-viewer.component';
import {AnalyticsGuard} from '@core/guards/analytics.guard';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsOverviewComponent,
    canActivate: [AnalyticsGuard],
    data: { title: 'pageTitles.analytics' }
  },
  {
    path: 'dashboard/:id',
    component: DashboardViewerComponent,
    canActivate: [AnalyticsGuard],
    data: { title: 'pageTitles.analytics' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule { }

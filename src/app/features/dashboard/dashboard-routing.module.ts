import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {dashboardResolver} from './resolvers/dashboard.resolver';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    resolve: {resolvedData: dashboardResolver},
    data: {title: 'pageTitles.dashboard'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}

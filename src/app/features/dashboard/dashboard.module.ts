import {NgModule} from '@angular/core';
import {DashboardRoutingModule} from './dashboard-routing.module';
import {NgxEchartsModule} from 'ngx-echarts';
import * as echarts from 'echarts';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {SharedModule} from '@shared/shared.module';
import {ReservationViewerComponent} from './components/reservation-viewer/reservation-viewer.component';
import {GregorianDateViewerComponent} from './components/reservation-viewer/reservation-viewer.component';
import {IslamicDateViewerComponent} from './components/reservation-viewer/reservation-viewer.component';
import {ReservedDatePipe} from './pipes/reserved-date.pipe';
import {DashboardChartComponent} from './components/dashboard-chart/dashboard-chart.component';
import {DashboardFailedStateComponent} from './components/dashboard-failed-state/dashboard-failed-state.component';
import {KeyMetricsComponent} from './components/key-metrics/key-metrics.component';
import {NewDashboardChartComponent} from './components/new-dashboard-chart/new-dashboard-chart.component';
import {RecentTransactionsComponent} from './components/recent-transactions/recent-transactions.component';
import {NextBookingComponent} from './components/next-booking/next-booking.component';
import { SubscriptionStatusComponent } from './components/subscription-status/subscription-status.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ReservationViewerComponent,
    GregorianDateViewerComponent,
    IslamicDateViewerComponent,
    ReservedDatePipe,
    DashboardChartComponent,
    DashboardFailedStateComponent,
    KeyMetricsComponent,
    NewDashboardChartComponent,
    RecentTransactionsComponent,
    NextBookingComponent,
    SubscriptionStatusComponent,
  ],
  imports: [
    SharedModule,
    DashboardRoutingModule,
    NgxEchartsModule.forRoot({
      echarts,
    }),
  ],
})
export class DashboardModule {}

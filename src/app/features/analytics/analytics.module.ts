import {NgModule} from '@angular/core';
import {AnalyticsOverviewComponent} from './components/analytics-overview/analytics-overview.component';
import {DashboardViewerComponent} from './components/dashboard-viewer/dashboard-viewer.component';
import {AnalyticsRoutingModule} from './analytics-routing.module';
import {SharedModule} from '@shared/shared.module';
import {BookingFacadeService} from '@orders/services/booking-facade.service';

@NgModule({
  declarations: [
    AnalyticsOverviewComponent,
    DashboardViewerComponent,
  ],
  imports: [
    AnalyticsRoutingModule,
    SharedModule,
  ],
  providers: [BookingFacadeService],
})
export class AnalyticsModule {}

import {inject} from '@angular/core';
import {ResolveFn} from '@angular/router';
import {DashboardResolvedData} from '@dashboard/models/dashboard.model';
import {DashboardFacadeService} from '@dashboard/services/dashboard-facade.service';
import {combineLatest, Observable} from 'rxjs';

export const dashboardResolver: ResolveFn<Observable<DashboardResolvedData>> = (
  route,
  state,
) => {
  const dashboardFacade = inject(DashboardFacadeService);
  return combineLatest({
    keyMetrics: dashboardFacade.keyMetrics$,
    upcomingBooking: dashboardFacade.upcomingBooking$,
    reservedBookings: dashboardFacade.reservedBookings$,
    chartData: dashboardFacade.chartData$,
  });
};

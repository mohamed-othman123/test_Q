import {Inject, Injectable} from '@angular/core';
import {APP_ENVIRONMENT} from '@core/constants';
import {Environment} from '@core/models';
import {AuthService} from '@core/services';
import {Hall} from '@halls/models/halls.model';

@Injectable({
  providedIn: 'root',
})
export class GaConfigService {
  constructor(
    @Inject(APP_ENVIRONMENT) private env: Environment,
    private authService: AuthService,
  ) {}

  getMeasurementId(): string {
    return this.env.googleAnalyticsMeasurementId || 'G-XXXXXXXXXX';
  }

  getOrganizationInfo(): string {
    return `${this.authService.userData?.user.name}-${this.authService.userData?.user.clientId}`;
  }

  getHallInfo(): string {
    const currentHall = localStorage.getItem('LAST_SELECTED_HALL') || null;
    if (!currentHall) {
      return '';
    }
    const hall: Hall = JSON.parse(currentHall);

    return `${hall.name}-${hall.id}`;
  }
}

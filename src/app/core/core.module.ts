import {NgModule, Optional, SkipSelf} from '@angular/core';
import {environment} from '../environments/environment';
import {APP_ENVIRONMENT} from './constants';
import {errorInterceptor} from '@core/interceptors';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import {authInterceptor} from './interceptors';
import {TitleStrategy} from '@angular/router';
import {CustomTitleStrategy} from './strategies/custom-title.strategy';
import {GtagService} from './analytics/gtag.service';
import {GaConfigService} from './analytics/ga-config.service';

@NgModule({
  providers: [
    {provide: TitleStrategy, useClass: CustomTitleStrategy},
    {provide: APP_ENVIRONMENT, useValue: environment},
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
})
export class CoreModule {
  constructor(
    @Optional() @SkipSelf() coreModule: CoreModule,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {
    if (coreModule) {
      throw new Error(
        `${coreModule} has already been loaded. Import Core module in the AppModule only.`,
      );
    }

    gtag.config(gaConfig.getMeasurementId(), {
      organizationInfo: gaConfig.getOrganizationInfo(),
      hallInfo: gaConfig.getHallInfo(),
    });
  }
}

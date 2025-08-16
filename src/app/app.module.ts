import { CSP_NONCE, NgModule, inject, provideAppInitializer } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {CoreModule} from '@core/core.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DatePipe} from '@angular/common';
import {SharedModule} from '@shared/shared.module';
import {AuthModule} from '@auth/auth.module';
import {LayoutModule} from '@layout/layout.module';
import {ConfirmationService, MessageService, PrimeNGConfig} from 'primeng/api';
import {LottieComponent} from 'ngx-lottie';
import {LocalizationInitService} from '@core/services/localization-init.service';
import {HallsService} from '@halls/services/halls.service';
import {AuthService} from '@core/services';
import {ConfirmationModalComponent} from '@shared/components/confirmation-modal/confirmation-modal.component';
import {ConfirmationModalService} from '@core/services/confirmation-modal.service';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function initializeLocalization(
  localizationInitService: LocalizationInitService,
) {
  return () => localizationInitService.initializeLocalization();
}

export function initializeHalls(
  hallsService: HallsService,
  authService: AuthService,
) {
  return () => {
    if (authService.isLoggedIn) {
      return hallsService
        .initializeHalls()
        .toPromise()
        .then((success) => Promise.resolve(success));
    } else {
      return Promise.resolve();
    }
  };
}
const nonce = (
  document.querySelector('meta[name="CSP_NONCE"]') as HTMLMetaElement
)?.content;
const initializePrimeConfig = (primeConfig: PrimeNGConfig) => () => {
  primeConfig.ripple = true;
  primeConfig.csp.set({nonce});
};

@NgModule({ declarations: [AppComponent, ConfirmationModalComponent],
    bootstrap: [AppComponent], imports: [BrowserModule,
        BrowserAnimationsModule,
        CoreModule,
        LayoutModule,
        SharedModule,
        AuthModule,
        AppRoutingModule,
        LottieComponent,
        TranslateModule.forRoot({
            defaultLanguage: 'ar',
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient],
            },
        })], providers: [
        MessageService,
        ConfirmationService,
        ConfirmationModalService,
        provideAppInitializer(() => {
        const initializerFn = (initializeLocalization)(inject(LocalizationInitService));
        return initializerFn();
      }),
        provideAppInitializer(() => {
        const initializerFn = (initializeHalls)(inject(HallsService), inject(AuthService));
        return initializerFn();
      }),
        provideAppInitializer(() => {
        const initializerFn = (initializePrimeConfig)(inject(PrimeNGConfig));
        return initializerFn();
      }),
        {
            provide: CSP_NONCE,
            useValue: nonce,
        },
        DatePipe,
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {}

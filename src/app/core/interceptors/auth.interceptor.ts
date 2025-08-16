import { HttpResponse, type HttpEvent, type HttpInterceptorFn } from '@angular/common/http';
import {inject} from '@angular/core';
import {APP_ENVIRONMENT} from '../constants';
import {Environment} from '../models';
import {AuthService} from '@core/services';
import {map, finalize} from 'rxjs';
import {StorageKeys} from '@core/enums';
import {LoaderService} from '@core/services';

let authorizationRequestCount = 0;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const loader = inject(LoaderService);
  const env = inject(APP_ENVIRONMENT) as Environment;

  const token = authService.userData?.token;
  const isLoggedIn = authService.isLoggedIn;
  const isApiUrl = req.url.startsWith(env.baseUrl);

  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const queryLanguage = urlParams.get('language');

  const lang =
    queryLanguage || localStorage.getItem(StorageKeys.LOCALE) || 'ar';

  loader.showLoader();

  const cloneRequestWithHeaders = (headers: Record<string, string>) => {
    return req.clone({setHeaders: headers});
  };

  let defaultHeaders: Record<string, string> = {};

  if (!req.url.includes('/contract/')) {
    defaultHeaders = {
      'Accept-Language': lang,
    };
  }

  const authorizedHeaders = {
    ...defaultHeaders,
    Authorization: `Bearer ${token}`,
  };

  if (isApiUrl) {
    if (isLoggedIn) {
      authorizationRequestCount++;
      req = cloneRequestWithHeaders(
        req.body instanceof FormData
          ? authorizedHeaders
          : {...authorizedHeaders},
      );
    } else {
      req = cloneRequestWithHeaders(defaultHeaders);
    }
  }

  return next(req).pipe(
    map((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        if ([200, 201].includes(event.status) && event.ok && event.body) {
          return event.clone({body: isApiUrl ? event.body?.data : event.body});
        }
      }
      return event;
    }),
    finalize(() => {
      loader.hideLoader();
    }),
  );
};

import type { HttpInterceptorFn } from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '@core/services';
import {catchError, switchMap, throwError} from 'rxjs';
import {MessageService} from 'primeng/api';
import {LoaderService} from '@core/services';
import {StorageKeys} from '@core/enums';
import {Router} from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const messageService = inject(MessageService);
  const loader = inject(LoaderService);
  const router = inject(Router);
  const lang = localStorage.getItem(StorageKeys.LOCALE);

  return next(req).pipe(
    catchError((err) => {
      // route to forbidden page if forbidden or unauthorized
      loader.hideLoader();
      if (err.status === 401) {
        if (err.error?.originalMessage === 'userNotActive') {
          authService.logout();
        }

        if (req.url.includes('/auth/refreshToken')) {
          authService.logout();
        }
        messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Error',
        });
        return authService.refreshToken().pipe(
          switchMap(() => {
            const updatedRequest = req.clone({
              headers: req.headers.set(
                'Authorization',
                `Bearer ${authService.userData?.token}`,
              ),
            });
            return next(updatedRequest);
          }),
        );
      } else if (err.status === 403) {
        messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Error',
        });
        router.navigateByUrl('forbidden');
      } else {
        messageService.add({
          severity: 'error',
          summary: lang == 'en' ? 'Error' : 'حدث خطأ',
          detail:
            err.error?.message || (lang == 'en' ? 'Error' : 'خطأ في النظام'),
        });
      }
      return throwError(() => err);
    }),
  );
};

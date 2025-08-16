import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const user = authService.userData;
  if (user) {
    return true;
  }
  // not logged in so redirect to login page with the return url
  router.navigate(['/auth/login'], {queryParams: {returnUrl: state.url}});
  return false;
};

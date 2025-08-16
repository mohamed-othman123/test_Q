import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '@core/services/auth.service';

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // redirect to home if already logged in
  if (auth.isLoggedIn) {
    router.navigate(['/']);
    return false;
  }
  return true;
};

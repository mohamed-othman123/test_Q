import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenHelper } from '../utils/token-helper';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    if (TokenHelper.hasAiFeature()) {
      return true;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }
}

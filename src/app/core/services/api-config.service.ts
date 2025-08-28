import {Inject, Injectable} from '@angular/core';
import {APP_ENVIRONMENT} from '@core/constants';
import {Environment} from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  private readonly versions = {
    'users': 'v1',
    'roles': 'v1',
    'auth': 'v1',
    'landing-pages': 'v1',
    'captcha': 'v1',
    'booking-price-requests': 'v1',
    'booking': 'v1',
    'halls-clients': 'v1',
    'statistics': 'v1',
    'events': 'v1',
    'expenses-items': 'v1',
    'halls': 'v1',
    'clients': 'v1',
    'payment': 'v1',
    'payment-method': 'v1',
    'permissions': 'v1',
    'purchase-categories': 'v1',
    'expense-payments': 'v1',
    'bank': 'v1',
    'expenses': 'v1',
    'services': 'v1',
    'suppliers': 'v1',
    'discounts': 'v1',
    'version': 'v1',
    'refund-requests': 'v1',
    'contract': 'v1',
    'analytics': 'v1',
    'ai-agent': 'v1'
  };

  constructor(@Inject(APP_ENVIRONMENT) private env: Environment) {}

  getApiBaseUrl(module: keyof typeof this.versions): string {
    const v = this.versions[module];
    return `${this.env.baseUrl}${v}/${module}`;
  }
}

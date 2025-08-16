import {inject} from '@angular/core';
import type {ActivatedRouteSnapshot, CanDeactivateFn} from '@angular/router';
import {of} from 'rxjs';
import {AddNewOrderComponent} from '@orders/pages/add-new-order/add-new-order.component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationModalService} from '@core/services/confirmation-modal.service';

export const canDeactivateOrder: CanDeactivateFn<AddNewOrderComponent> = (
  component,
  currentRoute: ActivatedRouteSnapshot,
) => {
  const confirmationModalService = inject(ConfirmationModalService);
  const router = inject(Router);

  const currentNavigation = router.getCurrentNavigation();

  if (currentNavigation?.extras.state?.['skipGuard']) {
    return of(true);
  }

  const targetUrl = currentNavigation?.initialUrl.toString() || '';

  if (targetUrl.includes('booking-success')) {
    return of(true);
  }

  return confirmationModalService.show(currentRoute.data['mode']);
};

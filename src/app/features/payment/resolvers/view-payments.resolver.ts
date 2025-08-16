import {inject} from '@angular/core';
import {ResolveFn, Router} from '@angular/router';
import {Booking, BookingDetails} from '@orders/models';
import {OrdersService} from '@orders/services/orders.service';
import {combineLatest, of} from 'rxjs';

export const viewPaymentsResolver: ResolveFn<{bookingDetails: Booking}> = (
  route,
  state,
) => {
  const orderService = inject(OrdersService);
  const router = inject(Router);

  const bookingDetails = router.getCurrentNavigation()?.extras
    .state as BookingDetails;
  const bookingId = route.params['id'];
  return combineLatest({
    bookingDetails: bookingDetails
      ? of(bookingDetails)
      : orderService.getBookingDetails(bookingId),
  });
};

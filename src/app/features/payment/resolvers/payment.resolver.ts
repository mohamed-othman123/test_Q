import {inject} from '@angular/core';
import {ResolveFn, Router} from '@angular/router';
import {Item, TableData} from '@core/models';
import {BookingDetails} from '@orders/models';
import {OrdersService} from '@orders/services/orders.service';
import {PaymentService} from '@payment/services/payment.service';
import {PaymentMethod} from '@paymentmethods/models/payment.model';
import {PaymentMethodsService} from '@paymentmethods/services/payment-methods.service';
import {combineLatest, Observable, of} from 'rxjs';

export const paymentResolver: ResolveFn<
  Observable<{
    paymentTypes: Item[];
    paymentMethods: TableData<PaymentMethod>;
  }>
> = (route, state) => {
  const paymentService = inject(PaymentService);
  const paymentMethodService = inject(PaymentMethodsService);
  const orderService = inject(OrdersService);
  const router = inject(Router);

  const bookingDetails = router.getCurrentNavigation()?.extras
    .state as BookingDetails;
  const bookingId = route.params['id'];
  return combineLatest({
    paymentTypes: paymentService.getPaymentTypes(),
    paymentMethods: paymentMethodService.getPaymentMethodsListForCurrentHall(),
    bookingDetails: bookingDetails
      ? of(bookingDetails)
      : orderService.getBookingDetails(bookingId),
    payment: route.queryParams['paymentId']
      ? paymentService.getPaymentById(route.queryParams['paymentId'])
      : of(null),
  });
};

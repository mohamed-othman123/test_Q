import {inject} from '@angular/core';
import {ResolveFn, Router} from '@angular/router';
import {Client} from '@clients/models/client.model';
import {Item, TableData} from '@core/models';
import {Event} from '@events/models/events.model';
import {BookingFacadeService} from '@orders/services/booking-facade.service';
import {OrdersService} from '@orders/services/orders.service';
import {PaymentService} from '@payment/services/payment.service';
import {Service} from '@services/models';
import {combineLatest, map, Observable, of, switchMap} from 'rxjs';

/**
 * Resolver for fetching initial data required for the orders feature
 * Uses BookingFacadeService to manage data fetching for clients, events, and services
 * @returns Observable containing all necessary data for order creation/editing
 */
export const ordersResolver: ResolveFn<
  Observable<{
    clients: TableData<Client>;
    events: TableData<Event>;
    services: TableData<Service>;
    attendeesTypes: Item[];
    bookingStatus: Item[];
  }>
> = (route, state) => {
  const bookingFacadeService = inject(BookingFacadeService);
  const paymentService = inject(PaymentService);
  const ordersService = inject(OrdersService);
  const router = inject(Router);

  const id = route.queryParams['id'];

  if (!id) {
    return combineLatest({
      hallSections: bookingFacadeService.getHallSections(),
      clients: bookingFacadeService.getClients(),
      events: bookingFacadeService.getEvents(),
      services: bookingFacadeService.getServices(),
      paymentMethods: bookingFacadeService.getPaymentMethods(),
      bookingStatus: ordersService.getBookingStatus(),
      attendeesTypes: ordersService.getAttendeesTypes(),
      paymentTypes: paymentService.getPaymentTypes(),
      discountsList: bookingFacadeService.getSpecialDiscountList(),
      attachments: of([]),
    });
  }

  return ordersService.getBookingDetails(id).pipe(
    switchMap((booking) => {
      return combineLatest({
        hallSections: bookingFacadeService.getHallSections(),
        clients: bookingFacadeService.getClients(),
        events: bookingFacadeService.getEvents(),
        attendeesTypes: ordersService.getAttendeesTypes(),
        services: bookingFacadeService.getServices(),
        paymentMethods: bookingFacadeService.getPaymentMethods(),
        bookingStatus: ordersService.getBookingStatus(),
        paymentTypes: paymentService.getPaymentTypes(),
        discountsList: bookingFacadeService.getSpecialDiscountList(),
        attachments: booking
          ? ordersService.getAttachmentsAsBlobs(booking.attachments)
          : of([]),
      }).pipe(
        map((combineLatest) => {
          return {...combineLatest, booking};
        }),
      );
    }),
  );
};

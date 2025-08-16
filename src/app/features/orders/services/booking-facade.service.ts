import {Injectable} from '@angular/core';
import {Client} from '@clients/models/client.model';
import {CustomersService} from '@clients/services/Customers.service';
import {Discount} from '@discounts/models/discounts.model';
import {DiscountsService} from '@discounts/services/discounts.service';
import {Event} from '@events/models/events.model';
import {EventsService} from '@events/services/events.service';
import {HallsService} from '@halls/services/halls.service';
import {PaymentMethod} from '@paymentmethods/models/payment.model';
import {PaymentMethodsService} from '@paymentmethods/services/payment-methods.service';
import {Service} from '@services/models/services.model';
import {ServicesService} from '@services/services/services.service';
import {map, switchMap, tap} from 'rxjs';

/**
 * Facade service that coordinates booking-related data access and state management.
 * Provides a unified interface for accessing clients, events, and services data
 * specifically in the context of bookings.
 *
 * This service maintains local state and coordinates between multiple underlying services,
 * ensuring all data is scoped to the current hall.
 */
@Injectable()
export class BookingFacadeService {
  /** Local cache of clients data */
  clients: Client[] = [];
  /** Local cache of events data */
  events: Event[] = [];
  /** Local cache of services data */
  services: Service[] = [];
  /** Local cache of services data */
  hallSections: any[] = [];

  paymentMethods: PaymentMethod[] = [];

  discountsList: Discount[] = [];

  constructor(
    private clientsService: CustomersService,
    private eventsService: EventsService,
    private servicesService: ServicesService,
    private hallsService: HallsService,
    private paymentMethodService: PaymentMethodsService,
    private discountsService: DiscountsService,
  ) {}

  /**
   * Fetches clients for the current hall and updates local state.
   * @returns Observable that emits the clients data
   */
  getClients() {
    return this.hallsService.currentHall$.pipe(
      switchMap((hall) => this.clientsService.getClients({hallId: hall?.id})),
      tap((clients) => (this.clients = clients.items)),
    );
  }

  /**
   * Fetches events for the current hall and updates local state.
   * @returns Observable that emits the events data
   */
  getEvents() {
    return this.hallsService.currentHall$.pipe(
      switchMap((hall) => this.eventsService.getListEvents({hallId: hall?.id})),
      tap((events) => (this.events = events.items)),
    );
  }

  /**
   * Fetches services for the current hall and updates local state.
   * @returns Observable that emits the services data
   */
  getServices() {
    return this.hallsService.currentHall$.pipe(
      switchMap((hall) => this.servicesService.getServices({hallId: hall?.id})),
      tap((services) => (this.services = services.items)),
    );
  }

  getHallSections() {
    return this.hallsService.currentHall$.pipe(
      switchMap((hall) =>
        this.hallsService.getHallSections(hall?.id as number),
      ),
      tap((hallSections) => (this.hallSections = hallSections)),
    );
  }

  getPaymentMethods() {
    return this.hallsService.currentHall$.pipe(
      switchMap((hall) =>
        this.paymentMethodService.getListPaymentMethods({
          hallId: hall?.id,
        }),
      ),
      tap((paymentMethods) => {
        this.paymentMethods = paymentMethods.items;
      }),
    );
  }

  getSpecialDiscountList() {
    return this.discountsService.getAllDiscounts().pipe(
      tap((data) => {
        this.discountsList = data.items;
      }),
      map((data) => data.items),
    );
  }
}

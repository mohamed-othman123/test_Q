import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  AttendeesType,
  Booking,
  BookingAvailabilityData,
  BookingPrice,
  BookingPriceResponse,
} from '@orders/models/orders.model';
import {
  combineLatest,
  debounceTime,
  filter,
  map,
  noop,
  startWith,
  Subscription,
  switchMap,
} from 'rxjs';
import moment from 'moment';
import {LanguageService, NotificationService} from '@core/services';
import {OrderFormService} from '@orders/services/order-form.service';
import {BookingFacadeService} from '@orders/services/booking-facade.service';
import {OrdersService} from '@orders/services/orders.service';
import {correctDateForTimezone} from '@core/utils';
import {HallsService} from '@halls/services/halls.service';
import {
  HallPriceCalculationType,
  HallPricingType,
} from '@halls/models/halls.model';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';

@Component({
    selector: 'app-add-new-order',
    templateUrl: './add-new-order.component.html',
    styleUrl: './add-new-order.component.scss',
    providers: [OrderFormService],
    standalone: false
})
export class AddNewOrderComponent implements OnInit, OnDestroy {
  subs = new Subscription();
  updatedBooking!: Booking;
  editMode: boolean = false;
  viewMode = false;
  currentStep: number = 1;
  bookingPrices!: BookingPriceResponse;
  bookingAvailabilityData!: BookingAvailabilityData;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public lang: LanguageService,
    public orderFormService: OrderFormService,
    public ordersService: OrdersService,
    private bookingFacadeService: BookingFacadeService,
    private hallsService: HallsService,
    private notificationService: NotificationService,
  ) {
    const mode = route.snapshot.data['mode'];

    this.route.data.subscribe((data) => {
      const booking = data['resolvedData'].booking;
      if (booking) {
        this.updatedBooking = booking;

        if (mode === 'edit') {
          this.orderFormService.mode = 'edit';
          this.editMode = true;
          this.orderFormService.populateForm(this.updatedBooking);
        }
      } else {
        if (
          this.hallsService.getCurrentHall()?.pricingType ===
          HallPricingType.FIXED
        ) {
          this.orderFormService.paymentForm
            .get('pricingType')
            ?.setValue(HallPricingType.FIXED);
          this.orderFormService.paymentForm
            .get('priceCalculationType')
            ?.setValue(
              this.hallsService.getCurrentHall()?.priceCalculationType!,
            );
          this.orderFormService.paymentForm
            .get('priceCalculationType')
            ?.disable();
        }
      }
    });
  }

  ngOnInit(): void {
    this.orderFormService.currentStep$.subscribe((step) => {
      this.currentStep = step;
    });
    const date = this.route.snapshot.queryParams['date'];
    this.handelDateQuery(date);
    this.orderFormService.updateTotalsListener().subscribe(noop);
    this.getBookingPrice();
    this.checkBookingAvailabilityListener();
  }

  getBookingPrice() {
    const sub = combineLatest({
      hall: this.hallsService.currentHall$,
      startDate:
        this.orderFormService.bookingInfoForm.controls.startDate.valueChanges.pipe(
          startWith(
            this.orderFormService.bookingInfoForm.controls.startDate.value,
          ),
        ),
      endDate:
        this.orderFormService.bookingInfoForm.controls.endDate.valueChanges.pipe(
          startWith(
            this.orderFormService.bookingInfoForm.controls.endDate.value,
          ),
        ),
      eventTime:
        this.orderFormService.bookingInfoForm.controls.eventTime.valueChanges.pipe(
          startWith(
            this.orderFormService.bookingInfoForm.controls.eventTime.value,
          ),
        ),
      eventType:
        this.orderFormService.bookingInfoForm.controls.eventType.valueChanges.pipe(
          startWith(
            this.orderFormService.bookingInfoForm.controls.eventType.value,
          ),
        ),
    })
      .pipe(
        debounceTime(500),
        filter(({hall, startDate, endDate, eventTime, eventType}) => {
          return (
            !!hall && !!startDate && !!endDate && !!eventTime && !!eventType
          );
        }),
        map(({hall, startDate, endDate, eventTime, eventType}) => {
          return {
            startDate: dateToGregorianIsoString(startDate!, 'short'),
            endDate: dateToGregorianIsoString(endDate!, 'short'),
            eventTime,
            eventId: eventType?.id,
            hallId: hall?.id,
          };
        }),
        switchMap((filters) => {
          return this.ordersService.getBookingPrice(filters as BookingPrice);
        }),
      )
      .subscribe((data) => {
        this.bookingPrices = data;
      });

    this.subs.add(sub);
  }

  checkBookingAvailabilityListener() {
    const sub = combineLatest({
      hall: this.hallsService.currentHall$,
      startDate:
        this.orderFormService.bookingInfoForm.controls.startDate.valueChanges.pipe(
          startWith(
            this.orderFormService.bookingInfoForm.controls.startDate.value,
          ),
        ),
      endDate:
        this.orderFormService.bookingInfoForm.controls.endDate.valueChanges.pipe(
          startWith(
            this.orderFormService.bookingInfoForm.controls.endDate.value,
          ),
        ),
    })
      .pipe(
        debounceTime(500),
        filter(({startDate, endDate}) => {
          return !!startDate && !!endDate;
        }),
        map(({hall, startDate, endDate}) => {
          startDate = dateToGregorianIsoString(startDate!, 'short') as string;
          endDate = dateToGregorianIsoString(endDate!, 'short') as string;

          return {hallId: hall?.id, startDate, endDate};
        }),
        switchMap((filters) => {
          return this.ordersService.checkBookingAvailability(filters);
        }),
      )
      .subscribe((data) => {
        this.bookingAvailabilityData = data;
      });

    this.subs.add(sub);
  }

  handelDateQuery(date: string) {
    if (date) {
      const selectedDate = moment(date).locale('en').toDate();

      this.orderFormService.bookingInfoForm.controls.dateType.setValue(
        'gregorian',
      );

      this.orderFormService.bookingInfoForm.controls.startDate.setValue(
        correctDateForTimezone(selectedDate.toString()),
        {emitEvent: true},
      );

      this.orderFormService.bookingInfoForm.controls.startDate.markAsTouched();
      this.orderFormService.bookingInfoForm.controls.startDate.updateValueAndValidity(
        {
          onlySelf: false,
          emitEvent: true,
        },
      );
    }
  }

  convertDate(date: string | null | Date) {
    return moment(date).locale('en').format('YYYY-MM-DD');
  }

  submitBooking() {
    if (!this.validateBookingChanges()) {
      return;
    }

    const sub = this.orderFormService.submitBooking()?.subscribe(() => {
      this.router.navigate(['orders'], {state: {skipGuard: true}});
    });
    this.subs.add(sub);
  }

  private validateBookingChanges(): boolean {
    // If there's no updated booking nothing to validate.
    if (!this.updatedBooking) {
      return true;
    }

    const {bookingInfoForm, paymentForm} = this.orderFormService;
    const bookingControls = bookingInfoForm.controls;
    const paymentControls = paymentForm.controls;

    const formStartDate = this.convertDate(bookingControls.startDate.value);
    const formEndDate = this.convertDate(bookingControls.endDate.value);
    const updatedStartDate = this.convertDate(this.updatedBooking.startDate);
    const updatedEndDate = this.convertDate(this.updatedBooking.endDate);

    const isStartDateChanged = !moment(updatedStartDate).isSame(
      moment(formStartDate),
    );
    const isEndDateChanged = !moment(updatedEndDate).isSame(
      moment(formEndDate),
    );
    const isEventTimeChanged =
      this.updatedBooking.eventTime !== bookingControls.eventTime.value;

    const isPricingTypeChanged =
      paymentControls.pricingType.value !== this.bookingPrices.pricingType;

    const isBookingTypeChanged =
      bookingControls.isConfirmed.value &&
      this.updatedBooking.isConfirmed === false;

    const isEventTypeChanged =
      bookingControls.eventType.value?.id !== this.updatedBooking.eventType.id;

    if (
      isStartDateChanged ||
      isEndDateChanged ||
      isEventTimeChanged ||
      isBookingTypeChanged ||
      isEventTypeChanged
    ) {
      if (isPricingTypeChanged) {
        this.notificationService.showError('orders.bookingInfoChanged');
        return false;
      }
      if (
        paymentControls.pricingType.value === HallPricingType.FIXED ||
        paymentControls.pricingType.value === HallPricingType.EVENT
      ) {
        if (!this.orderFormService.doPricesReset) {
          return true;
        }
        const isFixedPriceCalculation =
          paymentControls.priceCalculationType.value ===
          HallPriceCalculationType.FIXED_PRICE;

        const fixedPrice = paymentControls.fixedBookingPrice.value;
        const malePricePerAttendee = paymentControls.malePricePerAttendee.value;
        const femalePricePerAttendee =
          paymentControls.femalePricePerAttendee.value;
        const attendeesType =
          this.orderFormService.bookingInfoForm.controls.attendeesType.value
            ?.value;

        if (
          isFixedPriceCalculation &&
          this.bookingPrices.totalAmount !== fixedPrice
        ) {
          this.notificationService.showError('orders.bookingInfoChanged');
          return false;
        }

        switch (attendeesType) {
          case AttendeesType.MEN:
            if (
              !isFixedPriceCalculation &&
              this.bookingPrices.totalAmountMen !== malePricePerAttendee
            ) {
              this.notificationService.showError('orders.bookingInfoChanged');
              return false;
            }
            break;
          case AttendeesType.WOMEN:
            if (
              !isFixedPriceCalculation &&
              this.bookingPrices.totalAmountWomen !== femalePricePerAttendee
            ) {
              this.notificationService.showError('orders.bookingInfoChanged');
              return false;
            }
            break;
          case AttendeesType.MEN_AND_WOMEN:
            if (
              !isFixedPriceCalculation &&
              (this.bookingPrices.totalAmountMen !== malePricePerAttendee ||
                this.bookingPrices.totalAmountWomen !== femalePricePerAttendee)
            ) {
              this.notificationService.showError('orders.bookingInfoChanged');
              return false;
            }
        }
      }
    }
    return true;
  }

  changeStep(step: number) {
    this.orderFormService.changeStep(step);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

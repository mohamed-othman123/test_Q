import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Item, TableData} from '@core/models';
import {LanguageService} from '@core/services';
import {discountValidator} from '@core/validators/discount-validators';
import {Discount} from '@discounts/models/discounts.model';
import {
  HallPriceCalculationType,
  HallPricingType,
} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {
  Booking,
  BookingPriceResponse,
  DiscountType,
  SelectedDiscountType,
} from '@orders/models/orders.model';
import {OrderFormService} from '@orders/services/order-form.service';
import {PaymentMethod} from '@paymentmethods/models/payment.model';
import {Service} from '@services/models';
import {startWith, Subject, Subscription, takeUntil} from 'rxjs';

@Component({
    selector: 'app-payment-details',
    templateUrl: './payment-details.component.html',
    styleUrl: './payment-details.component.scss',
    standalone: false
})
export class PaymentDetailsComponent implements OnInit, OnDestroy {
  paymentTypes!: Item[];
  paymentMethods!: TableData<PaymentMethod>;
  filteredPaymentMethods: PaymentMethod[] = [];
  subs = new Subscription();
  @Input({required: true}) currentStep!: number;
  @Input() editMode!: boolean;
  @Input() bookingPrices!: BookingPriceResponse;
  @Output() currentStepChange = new EventEmitter<number>();

  selectedDiscount = SelectedDiscountType;
  discountType = DiscountType;
  isMatchedPriceCalculation = true;
  updatedBooking: Booking;
  mode!: string;
  discountsList: Discount[] = [];
  disableDiscount = false;

  showPaymentForm = true;

  destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hallsService: HallsService,
    public lang: LanguageService,
    private orderFormService: OrderFormService,
  ) {
    const resolvedData = route.snapshot.data['resolvedData'];
    this.paymentTypes = resolvedData.paymentTypes;
    this.paymentMethods = resolvedData.paymentMethods;
    this.updatedBooking = resolvedData.booking;
    this.discountsList = resolvedData.discountsList;
  }

  ngOnInit(): void {
    this.mode = this.orderFormService.mode;

    if (this.editMode) {
      this.formControls.paymentMethod.disable();
      this.formControls.paymentType.disable();
      this.showPaymentForm = false;
    }

    const hallSub = this.hallsService.currentHall$.subscribe((hall) => {
      if (hall) {
        this.filterItemsByHall(hall);
      }
    });
    this.subs.add(hallSub);
    this.priceCalculationTypeListener();
    this.paidAmountListener();
    this.checkIfThePriceCalculationIsMatched();
    if (this.mode === 'add') {
      this.applyHallPrices();
    }
    if (this.editMode) {
      this.disableUpdatePrice();
      this.handelDiscount();
    }

    this.handelChangeFromTempBookingToConfirmed();
    this.setDiscountValidator();
    this.selectedDiscountListener();
  }

  private filterItemsByHall(currentHall: any) {
    if (!currentHall?.id) return;
    this.filteredPaymentMethods = this.paymentMethods.items.filter((method) =>
      method.halls?.some((hall) => hall.id === currentHall?.id),
    );
  }

  private toggleControls(
    controls: Array<keyof typeof this.formControls>,
    opts: {enable: boolean; reset: boolean} = {enable: true, reset: false},
  ) {
    controls.forEach((controlName) => {
      const control = this.formControls[controlName];
      if (opts.enable) {
        control.enable();
      } else {
        control.disable();
      }
      if (opts.reset) {
        control.reset();
      }
    });
  }

  priceCalculationTypeListener() {
    this.formControls.priceCalculationType.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        startWith(this.formControls?.priceCalculationType?.value),
      )
      .subscribe((type) => {
        const isFixed = type === HallPriceCalculationType.FIXED_PRICE;

        this.formControls.fixedBookingPrice[isFixed ? 'enable' : 'disable']();
        if (!isFixed) this.formControls.fixedBookingPrice.reset();

        this.toggleControls(
          [
            'maleAttendeesCount',
            'malePricePerAttendee',
            'femaleAttendeesCount',
            'femalePricePerAttendee',
          ],
          {enable: !isFixed, reset: isFixed},
        );

        if (!isFixed) {
          const men =
            this.bookingInfoControls.attendeesType.value?.value === 'Men';
          const women =
            this.bookingInfoControls.attendeesType.value?.value === 'Women';

          this.toggleControls(['maleAttendeesCount', 'malePricePerAttendee'], {
            enable: men || (!men && !women),
            reset: !(men || (!men && !women)),
          });

          this.toggleControls(
            ['femaleAttendeesCount', 'femalePricePerAttendee'],
            {
              enable: women || (!men && !women),
              reset: !(women || (!men && !women)),
            },
          );
        }
      });
  }

  paidAmountListener() {
    this.formControls.paidAmount.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((amount) => {
        if (amount && amount > 0) {
          this.formControls.paymentMethod.addValidators([Validators.required]);
          this.formControls.paymentType.addValidators([Validators.required]);
        } else {
          this.formControls.paymentMethod.removeValidators([
            Validators.required,
          ]);
          this.formControls.paymentType.removeValidators([Validators.required]);
        }
        this.formControls.paymentMethod.updateValueAndValidity();
        this.formControls.paymentType.updateValueAndValidity();
      });
  }

  checkIfThePriceCalculationIsMatched() {
    if (this.bookingPrices) {
      if (
        this.formControls.pricingType.value === HallPricingType.BOOKING_TIME &&
        this.bookingPrices.pricingType === HallPricingType.BOOKING_TIME
      ) {
        this.isMatchedPriceCalculation = true;
        return;
      }

      if (
        this.formControls.pricingType.value !== this.bookingPrices.pricingType
      ) {
        this.isMatchedPriceCalculation = false;
        return;
      }

      if (
        this.bookingPrices.priceCalculationType ===
          HallPriceCalculationType.BOOKING_TIME &&
        (this.formControls.fixedBookingPrice.value ===
          this.bookingPrices.totalAmount ||
          this.formControls.malePricePerAttendee.value ===
            this.bookingPrices.totalAmountMen ||
          this.formControls.femalePricePerAttendee.value ===
            this.bookingPrices.totalAmountWomen ||
          !this.orderFormService.doPricesReset)
      ) {
        if (
          this.orderFormService.doPricesReset &&
          this.updatedBooking.eventType.id !==
            this.bookingInfoControls.eventType.value?.id
        ) {
          this.isMatchedPriceCalculation = false;
          return;
        }
        this.isMatchedPriceCalculation = true;
        return;
      }

      if (
        this.formControls.priceCalculationType.value ===
          HallPriceCalculationType.PER_PERSON &&
        this.updatedBooking?.attendeesType !==
          this.bookingInfoControls.attendeesType?.value?.value
      ) {
        this.isMatchedPriceCalculation = false;
        return;
      }

      if (
        (this.formControls.pricingType.value ===
          this.bookingPrices.pricingType &&
          this.formControls.priceCalculationType.value ===
            this.bookingPrices.priceCalculationType &&
          this.formControls.insuranceAmount.value ===
            this.bookingPrices.insuranceAmount &&
          this.formControls.fixedBookingPrice.value ===
            this.bookingPrices.totalAmount) ||
        this.formControls.malePricePerAttendee.value ===
          this.bookingPrices.totalAmountMen ||
        this.formControls.femalePricePerAttendee.value ===
          this.bookingPrices.totalAmountWomen
      ) {
        this.isMatchedPriceCalculation = true;
        return;
      }

      this.isMatchedPriceCalculation = false;
    }
  }

  applyHallPrices() {
    if (this.bookingPrices) {
      if (
        this.bookingPrices.pricingType === HallPricingType.BOOKING_TIME &&
        this.formControls.pricingType.value === HallPricingType.BOOKING_TIME
      ) {
        return;
      }

      if (
        this.bookingPrices.priceCalculationType ===
        HallPriceCalculationType.BOOKING_TIME
      ) {
        if (this.orderFormService.doPricesReset) {
          this.formControls.priceCalculationType.reset();
          this.formControls.priceCalculationType.enable();
          this.formControls.insuranceAmount.reset();
          this.formControls.insuranceAmount.enable();
        }
        this.orderFormService.doPricesReset = false;
        this.isMatchedPriceCalculation = true;
        return;
      }

      this.formControls.pricingType.setValue(this.bookingPrices.pricingType);

      if (this.bookingPrices.priceCalculationType === 'FIXED_PRICE') {
        this.formControls.fixedBookingPrice.setValue(
          this.bookingPrices.totalAmount,
        );
      }

      if (this.bookingPrices.priceCalculationType === 'PER_PERSON') {
        this.formControls.malePricePerAttendee.setValue(
          this.bookingPrices.totalAmountMen,
        );
        this.formControls.femalePricePerAttendee.setValue(
          this.bookingPrices.totalAmountWomen,
        );
      }

      this.formControls.insuranceAmount.setValue(
        this.bookingPrices.insuranceAmount,
      );
      if (this.bookingPrices.insuranceAmount > 0) {
        this.formControls.insuranceAmount.disable();
      } else {
        this.formControls.insuranceAmount.enable();
      }

      if (
        this.bookingPrices.pricingType === HallPricingType.FIXED ||
        this.bookingPrices.pricingType === HallPricingType.EVENT
      ) {
        this.formControls.priceCalculationType.setValue(
          this.bookingPrices.priceCalculationType,
        );
        this.formControls.priceCalculationType.disable();
        this.formControls.fixedBookingPrice.disable();

        this.formControls.malePricePerAttendee.disable();
        this.formControls.femalePricePerAttendee.disable();
      }
      this.orderFormService.doPricesReset = true;

      this.isMatchedPriceCalculation = true;
    }
  }

  disableUpdatePrice() {
    if (
      this.bookingPrices.priceCalculationType ===
      HallPriceCalculationType.BOOKING_TIME
    ) {
      return;
    }

    if (this.isMatchedPriceCalculation && this.bookingPrices) {
      if (this.bookingPrices.insuranceAmount > 0) {
        this.formControls.insuranceAmount.disable();
      }
      if (
        this.bookingPrices.pricingType === HallPricingType.FIXED ||
        this.bookingPrices.pricingType === HallPricingType.EVENT
      ) {
        this.formControls.priceCalculationType.disable();
        this.formControls.fixedBookingPrice.disable();

        this.formControls.malePricePerAttendee.disable();
        this.formControls.femalePricePerAttendee.disable();
      }
    }
  }

  handelChangeFromTempBookingToConfirmed() {
    if (
      this.editMode &&
      this.updatedBooking.isConfirmed === false &&
      this.bookingInfoControls.isConfirmed.value
    ) {
      this.showPaymentForm = true;
      this.formControls.paymentMethod.enable();
      this.formControls.paymentType.enable();
    }
  }

  get formControls() {
    return this.orderFormService.paymentForm.controls;
  }

  get form() {
    return this.orderFormService.paymentForm;
  }

  get bookingInfoControls() {
    return this.orderFormService.bookingInfoForm.controls;
  }

  get totalServiceFee() {
    const services =
      this.orderFormService.additionalServicesForm.controls.services.value;
    return (
      services?.reduce(
        (acc: number, service: Service) => acc + service.price,
        0,
      ) || 0
    );
  }

  get services() {
    return this.orderFormService.additionalServicesForm.controls.services.value;
  }

  changeStep(step: number) {
    this.orderFormService.changeStep(step, this.form);
  }

  navigateToOrders() {
    this.router.navigateByUrl('orders');
  }

  setDiscountValidator() {
    this.form.setValidators(
      discountValidator('discountType', 'discountValue', 'subtotal'),
    );
    this.form.updateValueAndValidity();
  }

  calculatePerPersonPrice() {
    return (
      (this.formControls.maleAttendeesCount.value || 0) *
        (this.formControls.malePricePerAttendee.value || 0) +
      (this.formControls.femaleAttendeesCount.value || 0) *
        (this.formControls.femalePricePerAttendee.value || 0)
    );
  }

  selectedDiscountListener() {
    this.formControls.selectedDiscount.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((discount) => {
        if (discount === 'special') {
          this.formControls.discountValue.setValue(null);
          this.formControls.discountType.setValue(null);
        } else {
          this.onDiscountClear();
          this.formControls.discountType.setValue(discount as any);
        }
      });
  }

  handelDiscount() {
    if (
      this.updatedBooking.specialDiscount &&
      !this.orderFormService.discountReset
    ) {
      this.formControls.discountType.disable();
      this.formControls.discountValue.disable();
      this.disableDiscount = true;
    }
  }

  onDiscountChange(event: Discount) {
    if (!event) return;

    this.formControls.discountType.setValue(event.type as any);
    this.formControls.discountValue.setValue(event.value as any);
    this.formControls.discountType.disable();
    this.formControls.discountValue.disable();

    this.formControls.discountDetails.addValidators(Validators.required);
    this.formControls.discountDetails.updateValueAndValidity();
  }

  onDiscountClear() {
    this.formControls.discountType.enable();
    this.formControls.discountValue.enable();
    this.formControls.discountType.setValue(null);
    this.formControls.discountValue.setValue(null);
    this.formControls.specialDiscountId.setValue(null);

    this.formControls.discountDetails.removeValidators(Validators.required);
    this.formControls.discountDetails.updateValueAndValidity();
    this.disableDiscount = false;
    this.orderFormService.discountReset = true;
  }

  applyDiscount() {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

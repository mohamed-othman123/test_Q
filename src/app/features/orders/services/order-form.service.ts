import {Injectable} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Client} from '@clients/models/client.model';
import {Item, TableData} from '@core/models';
import {NotificationService} from '@core/services/notification.service';
import {Event} from '@events/models/events.model';
import {
  Hall,
  HallPriceCalculationType,
  HallSection,
} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {TranslateService} from '@ngx-translate/core';
import {
  BookingAttachments,
  AttendeesType,
  Booking,
  DiscountType,
  BookingEventTime,
  SelectedDiscountType,
} from '@orders/models';
import {Service} from '@services/models';
import {startWith, combineLatest, tap, BehaviorSubject, Observable} from 'rxjs';
import {OrdersService} from './orders.service';
import {ShakeableService} from '@core/services/shakeable.service';
import {PaymentMethod} from '@paymentmethods/models/payment.model';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';
import {Discount} from '@discounts/models/discounts.model';

/**
 * Service for managing order form state and operations
 */

@Injectable()
export class OrderFormService {
  bookingInfoForm = this.generateBookingInfoForm();
  additionalServicesForm = this.generateAdditionalServicesForm();
  attachmentsForm = this.generateAttachmentsForm();
  paymentForm = this.generatePaymentForm();
  private currentStepSubject = new BehaviorSubject<number>(1);
  currentStep$: Observable<number> = this.currentStepSubject.asObservable();
  private updatedBookingId!: number;
  updatedBooking: Booking | null = null;
  private resolvedData: {
    clients: TableData<Client>;
    events: TableData<Event>;
    services: TableData<Service>;
    attendeesTypes: Item[];
    attachments: BookingAttachments[];
  };

  mode: 'view' | 'edit' | 'add' = 'add';
  doPricesReset = true;
  discountReset = false;

  get bookingId() {
    return this.updatedBookingId;
  }

  constructor(
    private fb: FormBuilder,
    private hallsService: HallsService,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private ordersService: OrdersService,
    private shakeableService: ShakeableService,
  ) {
    this.resolvedData = this.route.snapshot.data['resolvedData'];
  }

  generateBookingInfoForm() {
    return this.fb.group({
      isConfirmed: new FormControl<boolean>(true, [Validators.required]),
      startDate: new FormControl<string | null>(null, [Validators.required]),
      endDate: new FormControl<string | null>(null, [Validators.required]),
      dateType: new FormControl<'gregorian' | 'islamic'>('islamic'),
      eventTime: new FormControl<BookingEventTime | null>(null, [
        Validators.required,
      ]),
      setFoodTime: new FormControl<boolean>(false),
      foodTime: new FormControl<string | null>(null),
      client: new FormControl<Client | null>(null, {
        validators: Validators.required,
      }),
      eventType: new FormControl<Event | null>(null, {
        validators: Validators.required,
      }),
      attendeesType: new FormControl<Item | null>(null, {
        validators: Validators.required,
      }),
      sectionIds: new FormControl<HallSection[]>([], {
        validators: Validators.required,
      }),
      notes: new FormControl<string | null>(null),
    });
  }

  generateAdditionalServicesForm() {
    return this.fb.group({
      services: new FormControl<Service[] | null>(null),
    });
  }

  generateAttachmentsForm() {
    return this.fb.group({
      attachments: new FormControl<BookingAttachments[] | null>(null),
    });
  }

  generatePaymentForm() {
    const form = this.fb.group({
      pricingType: new FormControl<string>('BOOKING_TIME'),
      priceCalculationType: new FormControl<HallPriceCalculationType>(
        HallPriceCalculationType.FIXED_PRICE,
        {
          validators: [Validators.required],
        },
      ),
      fixedBookingPrice: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(0)],
      }),
      maleAttendeesCount: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(0)],
      }),
      femaleAttendeesCount: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(0)],
      }),
      malePricePerAttendee: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(0)],
      }),
      femalePricePerAttendee: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(0)],
      }),
      // the price of booking and the services price
      subtotal: new FormControl<number | null>(null),
      selectedDiscount: new FormControl<SelectedDiscountType | null>(null), //helper value
      specialDiscountId: new FormControl<Discount | null>(null),
      discountDetails: new FormControl<string | null>(null),
      discountValue: new FormControl<number | null>(null, {
        validators: Validators.min(0),
      }),
      discountType: new FormControl<DiscountType | null>(null),
      discountAmount: new FormControl<number | null>(null), //helper value
      amountAfterDiscount: new FormControl<number | null>(0),
      vat: new FormControl<number | null>(15, {
        validators: Validators.required,
      }),
      vatAmount: new FormControl<number | null>(0), // helper value
      insuranceAmount: new FormControl<number | null>(null, {
        validators: [Validators.min(0)],
      }),
      totalPayable: new FormControl<number | null>(null),
      remainingAmount: new FormControl<number | null>(null), //helper value
      paidAmount: new FormControl<number | null>(0, {
        validators: Validators.min(0),
      }),
      // amountAfterVat: new FormControl<number | null>(0),
      paymentType: new FormControl<Item | string>('Income'),
      paymentMethod: new FormControl<PaymentMethod | null>(null),
      notes: new FormControl<string | null>(null),
    });

    if (
      form.get('priceCalculationType')?.value ===
      HallPriceCalculationType.FIXED_PRICE
    ) {
      form.get('fixedBookingPrice')?.enable();
      form.get('attendeesNo')?.disable();
      form.get('pricePerAttendee')?.disable();
    } else {
      form.get('fixedBookingPrice')?.disable();
      form.get('attendeesNo')?.enable();
      form.get('pricePerAttendee')?.enable();
    }

    return form;
  }

  updateTotalsListener() {
    const maleAttendeesCount$ =
      this.paymentForm.controls.maleAttendeesCount.valueChanges.pipe(
        startWith(this.paymentForm.controls.maleAttendeesCount.value || '0'),
      );
    const femaleAttendeesCount$ =
      this.paymentForm.controls.femaleAttendeesCount.valueChanges.pipe(
        startWith(this.paymentForm.controls.femaleAttendeesCount.value || '0'),
      );
    const malePricePerAttendee$ =
      this.paymentForm.controls.malePricePerAttendee.valueChanges.pipe(
        startWith(this.paymentForm.controls.malePricePerAttendee.value || '0'),
      );
    const femalePricePerAttendee$ =
      this.paymentForm.controls.femalePricePerAttendee.valueChanges.pipe(
        startWith(
          this.paymentForm.controls.femalePricePerAttendee.value || '0',
        ),
      );
    const priceCalculationType$ =
      this.paymentForm.controls.priceCalculationType.valueChanges.pipe(
        startWith(this.paymentForm.controls.priceCalculationType.value),
      );
    const fixedBookingPrice$ =
      this.paymentForm.controls.fixedBookingPrice.valueChanges.pipe(
        startWith(this.paymentForm.controls.fixedBookingPrice.value || '0'),
      );
    const services$ =
      this.additionalServicesForm.controls.services.valueChanges.pipe(
        startWith(this.additionalServicesForm.controls.services.value),
      );
    const hall$ = this.hallsService.currentHall$.pipe(
      startWith(this.hallsService.getCurrentHall()),
    );
    const paidAmount$ = this.paymentForm.controls.paidAmount.valueChanges.pipe(
      startWith(this.paymentForm.controls.paidAmount.value),
    );

    const insuranceAmount$ =
      this.paymentForm.controls.insuranceAmount.valueChanges.pipe(
        startWith(this.paymentForm.controls.insuranceAmount.value),
      );

    const discountValue$ =
      this.paymentForm.controls.discountValue.valueChanges.pipe(
        startWith(this.paymentForm.controls.discountValue.value),
      );

    const discountType$ =
      this.paymentForm.controls.discountType.valueChanges.pipe(
        startWith(this.paymentForm.controls.discountType.value),
      );
    return combineLatest([
      maleAttendeesCount$,
      femaleAttendeesCount$,
      malePricePerAttendee$,
      femalePricePerAttendee$,
      priceCalculationType$,
      fixedBookingPrice$,
      services$,
      hall$,
      paidAmount$,
      insuranceAmount$,
      discountType$,
      discountValue$,
    ]).pipe(
      tap(() => {
        this.calculateTotals();
      }),
    );
  }
  calculateTotals() {
    const subtotal = this.calculateSubtotal();
    const discountAmount = this.calculateDiscountValue(subtotal);
    const amountAfterDiscount = subtotal - discountAmount;
    const vatAmount = this.calculateVatAmount(amountAfterDiscount);
    const insuranceAmount =
      +this.paymentForm.get('insuranceAmount')?.value! || 0;
    const totalPayable =
      subtotal - discountAmount + vatAmount + insuranceAmount;
    const paidAmount = this.paymentForm.get('paidAmount')?.value || 0;
    const remainingAmount = totalPayable - paidAmount;

    this.paymentForm.patchValue({
      subtotal,
      discountAmount,
      amountAfterDiscount,
      vatAmount,
      totalPayable,
      remainingAmount,
    });
  }
  calculateSubtotal() {
    const fixedBookingPrice =
      +this.paymentForm.get('fixedBookingPrice')?.value!;

    const maleAttendeesCount =
      +this.paymentForm?.controls?.maleAttendeesCount?.value!;
    const femaleAttendeesCount =
      +this.paymentForm?.controls?.femaleAttendeesCount?.value!;

    const malePricePerAttendee =
      +this.paymentForm?.controls?.malePricePerAttendee?.value!;
    const femalePricePerAttendee =
      +this.paymentForm?.controls?.femalePricePerAttendee?.value!;

    const totalServiceFee = this.calculateTotalServiceFee();

    if (
      this.paymentForm.get('priceCalculationType')?.value ===
      HallPriceCalculationType.FIXED_PRICE
    ) {
      return fixedBookingPrice! + totalServiceFee || 0;
    } else {
      return (
        (maleAttendeesCount * malePricePerAttendee! || 0) +
          (femaleAttendeesCount * femalePricePerAttendee! || 0) +
          totalServiceFee || 0
      );
    }
  }
  calculateTotalServiceFee() {
    const services = this.additionalServicesForm.controls.services.value;
    return (
      services?.reduce(
        (acc: number, service: Service) => acc + service.price!,
        0,
      ) || 0
    );
  }
  calculateDiscountValue(subtotal: number) {
    const discountType = this.paymentForm.get('discountType')?.value;
    const discountValue = +this.paymentForm.get('discountValue')?.value!;

    if (!discountValue) {
      return 0;
    }
    if (discountType === DiscountType.PERCENT) {
      return subtotal * (discountValue / 100);
    } else {
      return discountValue;
    }
  }
  calculateVatAmount(amount: number) {
    const vatRate = this.paymentForm.get('vat')?.getRawValue();
    if (!vatRate) {
      return 0;
    }
    return amount * (vatRate / 100);
  }

  getServicePriceByHall(service: Service, hall: Hall) {
    const servicePricePerHall = service.halls[0]; //the first hallService is the default since we are retrieving by hallId (should be changed to single value from backend)
    if (!servicePricePerHall?.price) {
      this.notificationService.showInfo(
        this.translateService.instant(
          'orders.serviceHasNoPriceInSelectedHall',
          {serviceName: service.name, hallName: hall.name},
        ),
      );
    }
    return parseFloat(servicePricePerHall?.price.toString() || '0');
  }

  generateSubmitDateForTemporaryBooking() {
    const data: any = {
      isConfirmed: this.bookingInfoForm.controls.isConfirmed.value,
      startDate: dateToGregorianIsoString(
        this.bookingInfoForm.controls.startDate.value as string,
      ),
      endDate: dateToGregorianIsoString(
        this.bookingInfoForm.controls.endDate.value as string,
      ),
      eventTime: this.bookingInfoForm.controls.eventTime.value,
      setFoodTime: this.bookingInfoForm.controls.setFoodTime.value,
      foodTime: this.bookingInfoForm.controls.setFoodTime.value
        ? this.bookingInfoForm.controls.foodTime.value
        : null,
      client: this.bookingInfoForm.controls.client.value?.id!,
      eventType: this.bookingInfoForm.controls.eventType.value?.id!,
      attendeesType: this.bookingInfoForm.controls.attendeesType?.value
        ?.value as AttendeesType,
      sectionIds: this.bookingInfoForm.controls.sectionIds.value?.map(
        (e) => e.id,
      ),
      notes: this.bookingInfoForm.controls.notes.value,
      services:
        (this.additionalServicesForm.controls.services.value! &&
          JSON.stringify(
            this.additionalServicesForm.controls.services.value?.map(
              (service: Service) => ({
                id: service.id,
                note: service.note,
                isNew: service.isNew,
              }),
            ),
          )) ||
        '[]',
    };

    if (!this.bookingId) {
      data.hallId = this.hallsService.getCurrentHall()?.id!;
    }

    return data;
  }

  generateSubmitDataForConfirmedBooking() {
    const submitData: any = {
      ...this.generateSubmitDateForTemporaryBooking(),
      pricingType: this.paymentForm.controls.pricingType.value,
      priceCalculationType:
        this.paymentForm.controls.priceCalculationType.value,
      fixedBookingPrice:
        +this.paymentForm.controls.fixedBookingPrice.value! || 0,

      maleAttendeesCount:
        +this.paymentForm.controls.maleAttendeesCount.value! || 0,
      femaleAttendeesCount:
        +this.paymentForm.controls.femaleAttendeesCount.value! || 0,
      malePricePerAttendee:
        +this.paymentForm.controls.malePricePerAttendee.value! || 0,
      femalePricePerAttendee:
        +this.paymentForm.controls.femalePricePerAttendee.value! || 0,

      subtotal: this.paymentForm.controls.subtotal.value,
      specialDiscountId:
        this.paymentForm.controls.specialDiscountId.value?.id || null,
      discountDetails: this.paymentForm.controls.discountDetails.value,
      discountValue: this.paymentForm.controls.discountValue.value || 0,
      discountType: this.paymentForm.controls.discountType.value,
      subtotalAfterDisc: this.paymentForm.controls.amountAfterDiscount.value!,
      vat: this.paymentForm.controls.vat.value!,
      totalPayable: this.paymentForm.controls.totalPayable.value,
      attachments: this.attachmentsForm.controls.attachments.value,
    };
    const paidAmount = +this.paymentForm.controls.paidAmount.value!;

    if (
      (this.updatedBooking &&
        !this.updatedBooking?.isConfirmed &&
        paidAmount > 0) ||
      (paidAmount && paidAmount > 0 && !this.bookingId)
    ) {
      let payment = {
        amount: paidAmount,
        paymentType: this.paymentForm.controls.paymentType.value!,
        paymentMethod: this.paymentForm.controls.paymentMethod.value?.id!,
        notes: this.paymentForm.controls.notes.value,
      };
      submitData.payment = payment;
    }
    const insuranceAmount = +this.paymentForm.controls.insuranceAmount.value!;
    if (!isNaN(insuranceAmount)) {
      submitData.insuranceAmount = insuranceAmount;
    }
    return submitData;
  }

  submitBooking() {
    const payload: any = this.bookingInfoForm.controls.isConfirmed.value
      ? this.generateSubmitDataForConfirmedBooking()
      : this.generateSubmitDateForTemporaryBooking();

    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      if (key === 'attachments' && payload[key]) {
        payload[key].forEach((attachment: BookingAttachments) => {
          formData.append(attachment.name, attachment.file); //this is crazy but required by the BE :)
        });
      } else if (key === 'payment' && payload[key]) {
        formData.append(key, JSON.stringify(payload[key]));
      } else {
        if (payload[key] !== null && payload[key] !== undefined) {
          formData.append(key, payload[key].toString());
        }
      }
    });

    const submissionApi = this.updatedBookingId
      ? this.ordersService.editOrder(this.updatedBookingId, formData)
      : this.ordersService.createOrder(formData);
    return submissionApi;
  }

  populateForm(booking: Booking) {
    this.updatedBookingId = booking.id!;
    this.updatedBooking = booking;
    const formData: any = {
      ...booking,
      dateType: 'gregorian',
      sectionIds: booking.sections,
      services: booking.services,
      client: this.resolvedData.clients.items.find(
        (client) => client.id === booking.user.id,
      )!,
      eventType: this.resolvedData.events.items.find(
        (event) => event.id === booking.eventType.id,
      )!,
      attendeesType: this.resolvedData.attendeesTypes.find(
        (attendee) => attendee.value === booking.attendeesType,
      )!,
      attachments: this.resolvedData.attachments,
      bookingDate: booking.bookingDate,
      vat: booking.vat || 15,
      specialDiscountId: booking.specialDiscount
        ? {id: booking.specialDiscount?.id}
        : null,
      selectedDiscount: booking.specialDiscount
        ? 'special'
        : booking.discountType,
    };
    this.bookingInfoForm.patchValue(formData);
    this.additionalServicesForm.patchValue(formData);
    this.attachmentsForm.patchValue(formData);
    this.paymentForm.patchValue(formData);
  }

  changeStep(step: number, form?: FormGroup) {
    const currentStep = this.currentStepSubject.getValue();
    if (form && form.invalid && step > currentStep) {
      form.markAllAsTouched();
      this.shakeableService.shakeInvalid();
      return;
    }
    this.currentStepSubject.next(step);
  }
  resetForm() {
    this.bookingInfoForm.reset();
    this.additionalServicesForm.reset();
    this.attachmentsForm.reset();
    this.paymentForm.reset();
  }

  disableForms() {
    this.bookingInfoForm.disable();
    this.additionalServicesForm.disable();
    this.attachmentsForm.disable();
    this.paymentForm.disable();
  }
}

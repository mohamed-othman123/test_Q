import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  FormArray,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import {
  Hall,
  HallPriceCalculationType,
  HallPricingSchedule,
  HallPricingType,
  HallSpecialPricing,
} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {finalize} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {takeUntil, debounceTime} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {noDoubleSpaceValidator} from '@core/validators';
import {FormStateService} from '@halls/services/form-state.service';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';
import {dateRangeValidator} from '@core/validators/date-range';
import {Event} from '@events/models/events.model';
import {LanguageService} from '@core/services';

@Component({
    selector: 'app-hall-pricing',
    templateUrl: './hall-pricing.component.html',
    styleUrls: ['./hall-pricing.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class HallPricingComponent implements OnInit, OnChanges, OnDestroy {
  @Input() hallId!: string;
  @Input() hall!: Hall;
  @Output() pricingUpdated = new EventEmitter<Hall>();
  @Output() formChanged = new EventEmitter<void>();

  pricingForm!: FormGroup;
  formInitialized: boolean = false;
  isSubmitting: boolean = false;
  initialFormValues: any = null;
  listenersInitialized: boolean = false;
  pricings: any[] = [];
  pricingTypes = Object.values(HallPricingType);
  pricingCalculationTypes = Object.values(HallPriceCalculationType);
  days: (keyof HallPricingSchedule)[] = [
    'saturday',
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
  ];
  @Input() events: any[] = [];
  availableEvents: any[] = [];

  showPricingForm: boolean = false;
  selectedEventId: number | null = null;
  bookingTimeBriefKey = 'halls.pricingTypeDescriptions.bookingTime';
  fixedAdminBriefKey = 'halls.pricingTypeDescriptions.fixedAdmin';
  eventPriceBriefKey = 'halls.pricingTypeDescriptions.eventPrice';
  fixedPriceBriefKey = 'halls.pricingCalculationDescriptions.fixedPrice';
  pricePerPersonBriefKey =
    'halls.pricingCalculationDescriptions.pricePerPerson';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private hallsService: HallsService,
    private translateService: TranslateService,
    private formStateService: FormStateService,
    public lang: LanguageService,
  ) {}

  ngOnInit(): void {
    this.getHallPricing();

    this.formStateService
      .getResetEvent()
      .pipe(takeUntil(this.destroy$))
      .subscribe((tabIndex) => {
        if (tabIndex === 4) {
          this.resetForm();
        }
      });
  }

  private getHallPricing() {
    this.hallsService
      .getHallPricing(Number(this.hallId), this.hall.pricingType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.pricings = res;
          this.availableEvents = this.findNewEvents(this.events, res);
          this.initForm();
        },
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['hallData'] &&
      changes['hallData'].currentValue &&
      this.formInitialized
    ) {
      this.patchFormValues(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.pricingForm = this.fb.group({
      pricingType: [HallPricingType.BOOKING_TIME, Validators.required],
      priceCalculationType: [HallPriceCalculationType.FIXED_PRICE],
      events: [[]],
      regularPricing: this.fb.group(
        {},
        {
          validators: this.allDaysPricingValidator(),
        },
      ),
      isSpecial: [false],
      specialDaysPricing: this.fb.array([]),
      insuranceAmount: [0],
    });

    const regularPricing = this.pricingForm.get('regularPricing') as FormGroup;
    this.days.forEach((day) => {
      regularPricing.addControl(day, this.createDayPricingGroup());
    });

    this.patchFormValues(false);

    this.initialFormValues = this.getFormValues();

    this.setupFormListeners();

    this.formInitialized = true;
  }

  private getFormValues(): any {
    const values = this.pricingForm.value;
    return JSON.parse(JSON.stringify(values));
  }

  private resetForm(): void {
    if (this.initialFormValues) {
      if (this.listenersInitialized) {
        this.destroy$.next();
      }

      this.pricingForm
        .get('pricingType')
        ?.setValue(this.initialFormValues.pricingType, {emitEvent: false});

      this.pricingForm
        .get('priceCalculationType')
        ?.setValue(this.initialFormValues.priceCalculationType, {
          emitEvent: false,
        });

      this.pricingForm
        .get('insuranceAmount')
        ?.setValue(this.initialFormValues.insuranceAmount, {emitEvent: false});

      const regularPricing = this.pricingForm.get(
        'regularPricing',
      ) as FormGroup;
      if (regularPricing && this.initialFormValues.regularPricing) {
        this.days.forEach((day) => {
          const initialDayPricing = this.initialFormValues.regularPricing[day];
          const dayGroup = regularPricing.get(day) as FormGroup;

          if (dayGroup && initialDayPricing) {
            dayGroup.patchValue(
              {
                morning: initialDayPricing.morning,
                evening: initialDayPricing.evening,
                fullDay: initialDayPricing.fullDay,
              },
              {emitEvent: false},
            );
          }
        });
      }

      this.pricingForm
        .get('isSpecial')
        ?.setValue(this.initialFormValues.isSpecial, {emitEvent: false});

      while (this.specialDaysPricing.length > 0) {
        this.specialDaysPricing.removeAt(0);
      }

      if (
        this.initialFormValues.isSpecial &&
        this.initialFormValues.specialDaysPricing &&
        this.initialFormValues.specialDaysPricing.length > 0
      ) {
        this.initialFormValues.specialDaysPricing.forEach((specialDay: any) => {
          const specialDayGroup = this.createSpecialDayGroup();
          specialDayGroup.patchValue(
            {
              title: specialDay.title,
              startDate: specialDay.startDate,
              endDate: specialDay.endDate,
              pricing: {
                morning: specialDay.pricing.morning,
                evening: specialDay.pricing.evening,
                fullDay: specialDay.pricing.fullDay,
              },
            },
            {emitEvent: false},
          );

          this.specialDaysPricing.push(specialDayGroup);
        });
      }

      this.setupFormListeners();
    }
  }

  private createDayPricingGroup(): FormGroup {
    return this.fb.group({
      morning: this.fb.group({
        menPrice: [null, [Validators.min(0)]],
        womenPrice: [null, [Validators.min(0)]],
        fixedPrice: [null, [Validators.min(0)]],
      }),
      evening: this.fb.group({
        menPrice: [null, [Validators.min(0)]],
        womenPrice: [null, [Validators.min(0)]],
        fixedPrice: [null, [Validators.min(0)]],
      }),
      fullDay: this.fb.group({
        menPrice: [null, [Validators.min(0)]],
        womenPrice: [null, [Validators.min(0)]],
        fixedPrice: [null, [Validators.min(0)]],
      }),
    });
  }

  private allDaysPricingValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const priceCalculationType = this.pricingForm?.get(
        'priceCalculationType',
      )?.value;

      const errors: any = {};
      const periods = ['morning', 'evening', 'fullDay'];

      this.days.forEach((day) => {
        const currentDay = control.get(day) as FormGroup;
        if (!currentDay) return;

        periods.forEach((period) => {
          const periodControl = currentDay.get(period);

          if (!periodControl) return;

          const menPrice = periodControl.get('menPrice')?.value;
          const womenPrice = periodControl.get('womenPrice')?.value;
          const fixedPrice = periodControl.get('fixedPrice')?.value;

          if (priceCalculationType === HallPriceCalculationType.FIXED_PRICE) {
            if (fixedPrice == null || fixedPrice === '') {
              errors['incompletePricing'] = true;
            }
          }

          if (priceCalculationType === HallPriceCalculationType.PER_PERSON) {
            if (menPrice == null || menPrice === '') {
              errors['incompletePricing'] = true;
            }
            if (womenPrice == null || womenPrice === '') {
              errors['incompletePricing'] = true;
            }
          }
        });
      });

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  updatePricing(index: number, id: number) {
    this.showPricingForm = true;
    this.selectedEventId = id;
    this.patchFormValues(false, index);
  }

  removePricing(id: number) {
    this.hallsService
      .deleteHallPricing(HallPricingType.EVENT, this.hallId, id.toString())
      .subscribe({
        next: (res) => {
          const index = this.pricings.findIndex((item) => item.id === id);
          if (index !== -1) {
            const removedItem = this.pricings.splice(index, 1)[0];
            this.availableEvents.push(removedItem);
          }
        },
      });
  }

  addNewPricing() {
    this.showPricingForm = true;
    this.selectedEventId = null;
  }

  createSpecialDayGroup(): FormGroup {
    return this.fb.group(
      {
        title: ['', Validators.required],
        startDate: [null, Validators.required],
        endDate: [null, Validators.required],
        dateType: ['islamic'],
        pricing: this.fb.group({
          morning: this.fb.group({
            menPrice: [null, [Validators.min(0)]],
            womenPrice: [null, [Validators.min(0)]],
            fixedPrice: [null, [Validators.min(0)]],
          }),
          evening: this.fb.group({
            menPrice: [null, [Validators.min(0)]],
            womenPrice: [null, [Validators.min(0)]],
            fixedPrice: [null, [Validators.min(0)]],
          }),
          fullDay: this.fb.group({
            menPrice: [null, [Validators.min(0)]],
            womenPrice: [null, [Validators.min(0)]],
            fixedPrice: [null, [Validators.min(0)]],
          }),
        }),
      },
      {validators: dateRangeValidator('startDate', 'endDate')},
    );
  }

  addSpecialDay(): void {
    this.specialDaysPricing.push(this.createSpecialDayGroup());
    this.formChanged.emit();
  }

  removeSpecialDay(index: number): void {
    this.specialDaysPricing.removeAt(index);
    this.formChanged.emit();

    if (this.specialDaysPricing.length === 0) {
      this.pricingForm.get('isSpecial')?.setValue(false);
    }
  }

  cancelEdit() {
    this.showPricingForm = false;
    this.selectedEventId = null;
    this.pricingForm.controls['specialDaysPricing'].reset();
    this.pricingForm.controls['events'].reset();
    this.pricingForm.controls['regularPricing'].reset();
    this.pricingForm.controls['isSpecial'].reset();
    this.pricingForm.controls['insuranceAmount'].patchValue(0);
    this.pricingForm.controls['priceCalculationType'].patchValue(
      HallPriceCalculationType.FIXED_PRICE,
    );
  }

  private patchFormValues(emitEvents: boolean = true, index: number = 0): void {
    if (!this.hall || !this.pricingForm) return;

    const subscription = this.pricingForm
      .get('isSpecial')
      ?.valueChanges.subscribe();
    subscription?.unsubscribe();

    const {pricingType} = this.hall;

    this.pricingForm
      .get('pricingType')
      ?.setValue(pricingType || HallPricingType.BOOKING_TIME, {
        emitEvent: emitEvents,
      });

    if (pricingType === HallPricingType.BOOKING_TIME) {
      this.updateValidationRules();

      if (!this.initialFormValues) {
        this.initialFormValues = this.getFormValues();
      }

      return;
    }

    const {
      priceCalculationType,
      regularPricing,
      specialDaysPricing,
      insuranceAmount,
    } = this.pricings[index];

    if (priceCalculationType) {
      this.pricingForm
        .get('priceCalculationType')
        ?.setValue(priceCalculationType, {emitEvent: emitEvents});
    }

    if (insuranceAmount !== undefined) {
      this.pricingForm
        .get('insuranceAmount')
        ?.setValue(insuranceAmount, {emitEvent: emitEvents});
    }

    if (regularPricing) {
      const regularPricingGroup = this.pricingForm.get(
        'regularPricing',
      ) as FormGroup;

      regularPricingGroup.patchValue(regularPricing, {emitEvent: emitEvents});
    }

    while (this.specialDaysPricing.length > 0) {
      this.specialDaysPricing.removeAt(0);
    }

    const hasSpecialDays = specialDaysPricing && specialDaysPricing.length > 0;
    this.pricingForm
      .get('isSpecial')
      ?.setValue(hasSpecialDays, {emitEvent: false});

    if (hasSpecialDays) {
      specialDaysPricing.forEach((specialDay: HallSpecialPricing) => {
        const specialDayGroup = this.createSpecialDayGroup();
        specialDayGroup.patchValue(
          {
            title: specialDay.title || '',
            startDate: specialDay.startDate,
            endDate: specialDay.endDate,
            dateType: 'gregorian',
            pricing: specialDay.pricing,
          },
          {emitEvent: emitEvents},
        );
        this.specialDaysPricing.push(specialDayGroup, {emitEvent: emitEvents});
      });
    } else if (this.pricingForm.get('isSpecial')?.value) {
      this.addSpecialDay();
    }

    this.updateValidationRules();

    if (!this.initialFormValues) {
      this.initialFormValues = this.getFormValues();
    }
  }

  private setupFormListeners(): void {
    if (this.listenersInitialized) {
      this.destroy$.next();
    }

    this.pricingForm.valueChanges
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.hasFormChanged()) {
          this.formChanged.emit();
        }
      });

    this.pricingForm
      .get('priceCalculationType')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((type) => {
        this.updateValidationRules();
      });

    this.listenersInitialized = true;
  }

  private hasFormChanged(): boolean {
    if (!this.initialFormValues) return false;

    const currentValues = this.getFormValues();

    if (currentValues.pricingType !== this.initialFormValues.pricingType) {
      return true;
    }

    if (currentValues.pricingType === HallPricingType.FIXED) {
      if (
        currentValues.priceCalculationType !==
        this.initialFormValues.priceCalculationType
      ) {
        return true;
      }

      if (
        Number(currentValues.insuranceAmount) !==
        Number(this.initialFormValues.insuranceAmount)
      ) {
        return true;
      }

      const currentPricing = currentValues.regularPricing;
      const initialPricing = this.initialFormValues.regularPricing;

      for (const day of this.days) {
        const currentDay = currentPricing[day];
        const initialDay = initialPricing[day];

        if (!currentDay || !initialDay) continue;

        if (
          Number(currentDay.morning.menPrice) !==
            Number(initialDay.morning.menPrice) ||
          Number(currentDay.morning.womenPrice) !==
            Number(initialDay.morning.womenPrice) ||
          Number(currentDay.morning.fixedPrice) !==
            Number(initialDay.morning.fixedPrice) ||
          Number(currentDay.evening.menPrice) !==
            Number(initialDay.evening.menPrice) ||
          Number(currentDay.evening.womenPrice) !==
            Number(initialDay.evening.womenPrice) ||
          Number(currentDay.evening.fixedPrice) !==
            Number(initialDay.evening.fixedPrice) ||
          Number(currentDay.fullDay.menPrice) !==
            Number(initialDay.fullDay.menPrice) ||
          Number(currentDay.fullDay.womenPrice) !==
            Number(initialDay.fullDay.womenPrice) ||
          Number(currentDay.fullDay.fixedPrice) !==
            Number(initialDay.fullDay.fixedPrice)
        ) {
          return true;
        }
      }

      if (currentValues.isSpecial !== this.initialFormValues.isSpecial) {
        return true;
      }

      if (currentValues.isSpecial) {
        const currentSpecialDays = currentValues.specialDaysPricing;
        const initialSpecialDays = this.initialFormValues.specialDaysPricing;

        if (
          !initialSpecialDays ||
          currentSpecialDays.length !== initialSpecialDays.length
        ) {
          return true;
        }

        for (let i = 0; i < currentSpecialDays.length; i++) {
          const current = currentSpecialDays[i];
          const initial = initialSpecialDays[i];

          if (
            current.title !== initial.title ||
            current.startDate !== initial.startDate ||
            current.endDate !== initial.endDate ||
            Number(current.pricing.morning.fixedPrice) !==
              Number(initial.pricing.morning.fixedPrice) ||
            Number(current.pricing.morning.menPrice) !==
              Number(initial.pricing.morning.menPrice) ||
            Number(current.pricing.morning.womenPrice) !==
              Number(initial.pricing.morning.womenPrice) ||
            Number(current.pricing.evening.fixedPrice) !==
              Number(initial.pricing.evening.fixedPrice) ||
            Number(current.pricing.evening.menPrice) !==
              Number(initial.pricing.evening.menPrice) ||
            Number(current.pricing.evening.womenPrice) !==
              Number(initial.pricing.evening.womenPrice) ||
            Number(current.pricing.fullDay.fixedPrice) !==
              Number(initial.pricing.fullDay.fixedPrice) ||
            Number(current.pricing.fullDay.menPrice) !==
              Number(initial.pricing.fullDay.menPrice) ||
            Number(current.pricing.fullDay.womenPrice) !==
              Number(initial.pricing.fullDay.womenPrice)
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  priceTypeListener(value: number) {
    this.pricingForm.get('pricingType')?.setValue(this.pricingTypes[value]);
    this.pricingForm.controls['isSpecial'].setValue(false);
    this.specialDaysPricing.clear();
    this.pricingForm.controls['regularPricing'].reset();
    this.pricingForm.controls['insuranceAmount'].patchValue(0);
    this.pricingForm.controls['priceCalculationType'].patchValue(
      HallPriceCalculationType.FIXED_PRICE,
    );

    this.showPricingForm = false;
    this.updateValidationRules();
  }

  updateValidationRules(): void {
    const pricingType = this.pricingForm.get('pricingType')?.value;
    const isBookingTime = pricingType === HallPricingType.BOOKING_TIME;
    const isSpecial = this.pricingForm.get('isSpecial')?.value;

    const insuranceAmountControl = this.pricingForm.get('insuranceAmount');
    const priceCalcControl = this.pricingForm.get('priceCalculationType');

    if (isBookingTime) {
      priceCalcControl?.clearValidators();
      insuranceAmountControl?.clearValidators();
      insuranceAmountControl?.updateValueAndValidity({emitEvent: false});
    } else {
      priceCalcControl?.setValidators(Validators.required);
      insuranceAmountControl?.setValidators([
        Validators.required,
        Validators.min(0),
        noDoubleSpaceValidator(),
      ]);
      insuranceAmountControl?.updateValueAndValidity({emitEvent: false});
    }
    priceCalcControl?.updateValueAndValidity({emitEvent: false});

    const regularPricing = this.pricingForm.get('regularPricing') as FormGroup;
    if (isBookingTime) {
      regularPricing.clearValidators();
    } else {
      regularPricing.setValidators(this.allDaysPricingValidator());
    }

    regularPricing.updateValueAndValidity();

    if (isSpecial) {
      for (let i = 0; i < this.specialDaysPricing.length; i++) {
        const specialDay = this.specialDaysPricing.at(i) as FormGroup;

        specialDay.get('title')?.setValidators(Validators.required);
        specialDay.get('startDate')?.setValidators(Validators.required);
        specialDay.get('endDate')?.setValidators(Validators.required);

        specialDay.get('title')?.updateValueAndValidity({emitEvent: false});
        specialDay.get('startDate')?.updateValueAndValidity({emitEvent: false});
        specialDay.get('endDate')?.updateValueAndValidity({emitEvent: false});

        const pricingGroup = specialDay.get('pricing') as FormGroup;
        if (pricingGroup) {
          ['morning', 'evening', 'fullDay'].forEach((timeSlot) => {
            const control = pricingGroup.get(timeSlot);

            if (!control) return;

            const fixedPrice = control?.get('fixedPrice');
            const menPrice = control?.get('menPrice');
            const womenPrice = control?.get('womenPrice');

            if (
              this.pricingForm.get('priceCalculationType')?.value ===
              HallPriceCalculationType.FIXED_PRICE
            ) {
              fixedPrice?.setValidators([
                Validators.required,
                Validators.min(0),
              ]);
              menPrice?.clearValidators();
              womenPrice?.clearValidators();
            }

            if (
              this.pricingForm.get('priceCalculationType')?.value ===
              HallPriceCalculationType.PER_PERSON
            ) {
              fixedPrice?.clearValidators();
              menPrice?.setValidators([Validators.required, Validators.min(0)]);
              womenPrice?.setValidators([
                Validators.required,
                Validators.min(0),
              ]);
            }

            fixedPrice?.updateValueAndValidity({emitEvent: false});
            menPrice?.updateValueAndValidity({emitEvent: false});
            womenPrice?.updateValueAndValidity({emitEvent: false});
          });
        }
      }
    } else {
      for (let i = 0; i < this.specialDaysPricing.length; i++) {
        const specialDay = this.specialDaysPricing.at(i) as FormGroup;

        specialDay.get('title')?.clearValidators();
        specialDay.get('startDate')?.clearValidators();
        specialDay.get('endDate')?.clearValidators();

        specialDay.get('title')?.updateValueAndValidity({emitEvent: false});
        specialDay.get('startDate')?.updateValueAndValidity({emitEvent: false});
        specialDay.get('endDate')?.updateValueAndValidity({emitEvent: false});

        const pricingGroup = specialDay.get('pricing') as FormGroup;
        if (pricingGroup) {
          ['morning', 'evening', 'fullDay'].forEach((timeSlot) => {
            const control = pricingGroup.get(timeSlot);

            if (!control) return;

            const fixedPrice = control?.get('fixedPrice');
            const menPrice = control?.get('menPrice');
            const womenPrice = control?.get('womenPrice');

            fixedPrice?.clearValidators();
            menPrice?.clearValidators();
            womenPrice?.clearValidators();

            fixedPrice?.updateValueAndValidity({emitEvent: false});
            menPrice?.updateValueAndValidity({emitEvent: false});
            womenPrice?.updateValueAndValidity({emitEvent: false});
          });
        }
      }
    }
  }

  submitPricing(): void {
    if (this.pricingForm.invalid) {
      this.pricingForm.markAllAsTouched();

      if (this.pricingForm.get('isSpecial')?.value) {
        for (let i = 0; i < this.specialDaysPricing.length; i++) {
          this.specialDaysPricing.at(i).markAsTouched();
        }
      }
      return;
    }

    const formData = this.prepareFormData();
    this.isSubmitting = true;

    if (this.selectedEventId === null) {
      this.hallsService
        .updateHallPricing(+this.hallId, formData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.isSubmitting = false)),
        )
        .subscribe({
          next: (res) => {
            this.showPricingForm = false;
            this.hall.pricingType = this.pricingForm.value.pricingType;
            this.getHallPricing();
            this.pricingUpdated.emit(this.hall);
          },
        });
    } else {
      this.hallsService
        .updateEventPricing(
          formData,
          this.hallId,
          HallPricingType.EVENT,
          this.selectedEventId.toString(),
        )
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.isSubmitting = false)),
        )
        .subscribe({
          next: (_) => {
            this.showPricingForm = false;
            this.selectedEventId = null;
            this.hall.pricingType = this.pricingForm.value.pricingType;
            this.getHallPricing();
            this.pricingUpdated.emit(this.hall);
          },
        });
    }
  }

  private prepareFormData(): any {
    const formValue = this.pricingForm.value;
    const isBookingTime =
      formValue.pricingType === HallPricingType.BOOKING_TIME;

    const data: any = {
      pricingType: formValue.pricingType,
      insuranceAmount: isBookingTime ? null : Number(formValue.insuranceAmount),
    };

    if (!isBookingTime) {
      data.priceCalculationType = formValue.priceCalculationType;
      data.regularPricing = {...formValue.regularPricing};

      this.convertToNumber(data.regularPricing);

      this.initialFormValues = this.getFormValues();

      if (formValue.isSpecial && this.specialDaysPricing.length > 0) {
        data.specialDaysPricing = this.specialDaysPricing.controls.map(
          (control) => {
            const specialDay = control.value;
            this.convertToNumber(specialDay.pricing);
            return {
              title: specialDay.title,
              startDate: dateToGregorianIsoString(specialDay.startDate),
              endDate: dateToGregorianIsoString(specialDay.endDate),
              pricing: specialDay.pricing,
            };
          },
        );
      } else {
        data.specialDaysPricing = [];
      }
    } else {
      data.priceCalculationType = null;
      data.regularPricing = null;
      data.specialDaysPricing = [];
    }

    if (this.isEventPrice) {
      data.events = formValue.events?.map((id: number) => ({eventId: id}));
    }

    return data;
  }

  private convertToNumber(data: any) {
    if (typeof data === 'object' && data !== null) {
      Object.keys(data).forEach((key) => {
        if (typeof data[key] !== 'object') {
          data[key] = Number(data[key]);
        } else if (typeof data[key] === 'object') {
          this.convertToNumber(data[key]);
        }
      });
    }
  }

  isLastSpecialDayValid(): boolean {
    if (this.specialDaysPricing.length === 0) {
      return true;
    }

    const lastIndex = this.specialDaysPricing.length - 1;
    const lastSpecialDay = this.getSpecialDayFormGroup(lastIndex);

    const isTitleValid = lastSpecialDay.get('title')?.valid;
    const isStartDateValid = lastSpecialDay.get('startDate')?.valid;
    const isEndDateValid = lastSpecialDay.get('endDate')?.valid;
    const isDateRangeValid = !lastSpecialDay.hasError('dateRange');

    const pricingGroup = lastSpecialDay.get('pricing') as FormGroup;
    const isMorningValid = pricingGroup?.get('morning')?.valid;
    const isEveningValid = pricingGroup?.get('evening')?.valid;
    const isFullDayValid = pricingGroup?.get('fullDay')?.valid;

    return !!(
      isTitleValid &&
      isStartDateValid &&
      isEndDateValid &&
      isMorningValid &&
      isEveningValid &&
      isFullDayValid &&
      isDateRangeValid
    );
  }

  toggleSpecialPricing(): void {
    const isSpecial = this.pricingForm.get('isSpecial')?.value;

    if (isSpecial && this.specialDaysPricing.length === 0) {
      this.addSpecialDay();
    }

    this.updateValidationRules();
  }

  getPricingTypeName(pricingType: HallPricingType): string {
    switch (pricingType) {
      case HallPricingType.BOOKING_TIME:
        return this.translateService.instant('halls.pricingTypes.booking_time');
      case HallPricingType.FIXED:
        return this.translateService.instant('halls.pricingTypes.fixed');
      default:
        return 'Unknown';
    }
  }

  get isBookingTime(): boolean {
    return (
      this.pricingForm?.get('pricingType')?.value ===
      HallPricingType.BOOKING_TIME
    );
  }

  get isFixedAdmin(): boolean {
    return (
      this.pricingForm?.get('pricingType')?.value === HallPricingType.FIXED
    );
  }

  get isEventPrice(): boolean {
    return (
      this.pricingForm?.get('pricingType')?.value === HallPricingType.EVENT
    );
  }

  get specialDaysPricing(): FormArray {
    return this.pricingForm.get('specialDaysPricing') as FormArray;
  }

  getFormControl(path: string): FormControl {
    return this.pricingForm.get(path) as FormControl;
  }

  getSpecialDayFormGroup(index: number): FormGroup {
    return this.specialDaysPricing.at(index) as FormGroup;
  }

  getSpecialDayTitleControl(index: number): FormControl {
    return this.getSpecialDayFormGroup(index).get('title') as FormControl;
  }

  getSpecialDayStartDateControl(index: number): FormControl {
    return this.getSpecialDayFormGroup(index).get('startDate') as FormControl;
  }

  getSpecialDayEndDateControl(index: number): FormControl {
    return this.getSpecialDayFormGroup(index).get('endDate') as FormControl;
  }

  getSpecialDayPricingControl(index: number, field: string): FormControl {
    return this.getSpecialDayFormGroup(index).get(
      `pricing.${field}`,
    ) as FormControl;
  }

  getDateTypeControl(index: number): FormControl {
    return this.getSpecialDayFormGroup(index).get('dateType') as FormControl;
  }
  setDateTypeValue(index: number, value: string): void {
    this.getDateTypeControl(index).setValue(value);
  }

  openSpecialDaysForm() {
    this.pricingForm.get('isSpecial')?.setValue(true);

    this.toggleSpecialPricing();
  }

  closeSpecialDaysForm() {
    this.pricingForm.get('isSpecial')?.setValue(false);

    this.toggleSpecialPricing();
  }

  hasDateRangeError(index: number): boolean {
    const specialDayGroup = this.getSpecialDayFormGroup(index);
    return (
      specialDayGroup.hasError('dateRange') &&
      specialDayGroup.get('startDate')?.value &&
      specialDayGroup.get('endDate')?.value
    );
  }

  findNewEvents(originalEvents: Event[], existingEvents: any[]): any[] {
    const existingIds = new Set(existingEvents.map((event) => event.id));
    return originalEvents.filter((event) => !existingIds.has(event.id));
  }
}

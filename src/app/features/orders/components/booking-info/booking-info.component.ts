import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Item} from '@core/models';
import {LanguageService} from '@core/services';
import {DrawerService} from '@core/services/drawer.service';
import {OrderFormService} from '@orders/services/order-form.service';
import {
  combineLatest,
  debounceTime,
  filter,
  map,
  noop,
  of,
  startWith,
  Subscription,
  switchMap,
} from 'rxjs';
import {HallsService} from '@halls/services/halls.service';
import {BookingFacadeService} from '@orders/services/booking-facade.service';
import {OrdersService} from '@orders/services/orders.service';
import {greatThanDateValidator} from '@core/validators/great-than-date.validator';
import {AbstractControl, Validators} from '@angular/forms';
import {HallSection} from '@halls/models/halls.model';
import {MultiSelectChangeEvent} from 'primeng/multiselect';
import {BookingAvailabilityData, BookingOverlap} from '@orders/models';
import {PermissionsService} from '@core/services/permissions.service';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';
import {ShakeableService} from '@core/services/shakeable.service';

@Component({
  selector: 'app-booking-info',
  templateUrl: './booking-info.component.html',
  styleUrl: './booking-info.component.scss',
  standalone: false,
})
export class BookingInfoComponent implements OnDestroy, OnInit {
  @Input({required: true}) currentStep!: number;
  @Input() bookingAvailabilityData!: BookingAvailabilityData;

  @Output() currentStepChange = new EventEmitter<number>();

  subs: Subscription = new Subscription();

  minDate = new Date();

  attendeesTypes: Item[];

  bookingTypeOptions: Item[] = [];

  eventTimeOptions: Item[] = [];

  hallSections: HallSection[] = [];

  selectedHallSections: HallSection[] = [];

  mode!: string;

  constructor(
    private route: ActivatedRoute,
    public lang: LanguageService,
    private router: Router,
    private drawerService: DrawerService,
    private orderFormService: OrderFormService,
    private hallsService: HallsService,
    public bookingFacadeService: BookingFacadeService,
    private ordersService: OrdersService,
    private permissionsService: PermissionsService,
    private shakeableService: ShakeableService,
  ) {
    const resolvedData = this.route.snapshot.data['resolvedData'];

    this.attendeesTypes = resolvedData.attendeesTypes;
    this.hallSections = resolvedData.hallSections.items;

    this.drawerService.drawerState$.subscribe((state) => {
      if (!state.visible && state.onCloseData) {
        if (state.mode === 'add') {
          this.handleNewlyAddedClient(state.onCloseData);
        }
      }
    });

    this.mode = orderFormService.mode;
  }

  ngOnInit(): void {
    if (this.formControls.isConfirmed.value) {
      this.ordersService.isConfirmed$.next(true);
    } else {
      this.ordersService.isConfirmed$.next(false);
    }

    this.formControls.isConfirmed.valueChanges.subscribe((val) => {
      this.ordersService.isConfirmed$.next(val as boolean);
    });

    this.ordersService.getEventTimes().subscribe((data) => {
      this.eventTimeOptions = data;
    });

    this.ordersService.getBookingTypes().subscribe((data) => {
      if (this.hallsService.getCurrentHall()?.dailyTempBookings === 0) {
        this.bookingTypeOptions = data.filter((item) => item.value === true);
      } else {
        this.bookingTypeOptions = data;
      }
    });

    this.setGreatThanDateValidator();

    this.selectedHallSections = this.form.controls.sectionIds.value!;
    this.foodTimesListener();
  }

  setGreatThanDateValidator() {
    const startDateControl = this.formControls
      .startDate as unknown as AbstractControl;

    this.formControls.endDate?.setValidators([
      greatThanDateValidator(startDateControl),
      Validators.required,
    ]);

    const sub = this.formControls.startDate.valueChanges.subscribe(() =>
      this.formControls.endDate?.updateValueAndValidity(),
    );
    this.subs.add(sub);
  }

  private handleNewlyAddedClient(newClient: any) {
    const currentHall = this.hallsService.getCurrentHall();
    if (currentHall) {
      this.bookingFacadeService.getClients().subscribe(() => {
        this.form.patchValue({
          client: newClient,
        });
      });
    }
  }

  get formControls() {
    return this.orderFormService.bookingInfoForm.controls;
  }

  get form() {
    return this.orderFormService.bookingInfoForm;
  }

  checkBookingOverlap() {
    return combineLatest({
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
      sectionIds:
        this.orderFormService.bookingInfoForm.controls.sectionIds.valueChanges.pipe(
          startWith(
            this.orderFormService.bookingInfoForm.controls.sectionIds.value,
          ),
        ),
      bookingId: of(this.orderFormService.bookingId),
    }).pipe(
      debounceTime(300),
      filter(({hall, startDate, endDate, eventTime, sectionIds}) => {
        return (
          !!hall &&
          !!startDate &&
          !!endDate &&
          !!eventTime &&
          !!sectionIds?.length
        );
      }),
      map(({hall, startDate, endDate, eventTime, sectionIds, bookingId}) => {
        startDate = dateToGregorianIsoString(startDate!, 'short') as string;
        endDate = dateToGregorianIsoString(endDate!, 'short') as string;

        return {
          hallId: hall?.id,
          startDate,
          endDate,
          eventTime,
          sectionIds: sectionIds?.map((s) => s.id)?.toString(),
          bookingId,
        };
      }),
      switchMap((payload) => {
        return this.ordersService.checkBookingOverlap(
          payload as BookingOverlap,
        );
      }),
    );
  }

  changeStep(step: number) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.shakeableService.shakeInvalid();
      return;
    }
    const sub = this.checkBookingOverlap().subscribe(() => {
      this.orderFormService.changeStep(step, this.form);
    });
    this.subs.add(sub);
  }

  openAddNewClientDrawer() {
    this.drawerService.open({
      mode: 'add',
      title: 'clients.addNewClient',
    });
  }

  navigateToOrders() {
    this.router.navigateByUrl('orders');
  }

  refreshClientsList() {
    const sub = this.bookingFacadeService.getClients().subscribe(noop);
    this.subs.add(sub);
  }

  onSelectHallSections(event: MultiSelectChangeEvent) {
    this.form.controls.sectionIds.setValue(event.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  dateTypeListener(type: any) {
    this.formControls.dateType.setValue(type);
  }

  canAddClient(): boolean {
    if (
      this.mode !== 'view' &&
      this.permissionsService.hasPermission('create:hallsClients')
    ) {
      return true;
    }
    return false;
  }

  foodTimesListener() {
    this.subs.add(
      this.formControls.setFoodTime.valueChanges
        .pipe(startWith(this.formControls.setFoodTime.value))
        .subscribe((value) => {
          if (value) {
            this.formControls.foodTime.setValidators([Validators.required]);
          } else {
            this.formControls.foodTime.clearValidators();
          }
          this.formControls.foodTime.updateValueAndValidity();
        }),
    );
  }
}

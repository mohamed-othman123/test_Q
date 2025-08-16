import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {HallsService} from '@halls/services/halls.service';
import {Booking, BookingDetails} from '@orders/models/orders.model';
import {OrderFormService} from '@orders/services/order-form.service';
import {LanguageService} from '@core/services';
import {OrdersService} from '@orders/services/orders.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

@Component({
    selector: 'app-booking-summary',
    templateUrl: './booking-summary.component.html',
    styleUrl: './booking-summary.component.scss',
    standalone: false
})
export class BookingSummaryComponent implements OnInit, OnDestroy {
  @Input({required: true}) currentStep!: number;
  @Output() currentStepChange = new EventEmitter<number>();
  @Input() updatedBooking!: Booking;

  isConfirmed = true;

  subs = new Subscription();

  mode!: string;

  constructor(
    private formService: OrderFormService,
    public ordersServices: OrdersService,
    public hallService: HallsService,
    public lang: LanguageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const sub = this.ordersServices.isConfirmed$.subscribe((val) => {
      this.isConfirmed = val;
    });
    this.subs.add(sub);

    this.mode = this.formService.mode;
  }

  get bookingDetails() {
    const formData = {
      ...this.formService.bookingInfoForm.getRawValue(),
      hall: this.hallService.getCurrentHall(),
      ...this.formService.additionalServicesForm.getRawValue(),
      ...this.formService.attachmentsForm.getRawValue(),
      ...this.formService.paymentForm.getRawValue(),
      bookingProcessStatus: this.updatedBooking?.bookingProcessStatus,
      remainingAmount:
        this.formService.paymentForm.getRawValue().remainingAmount ||
        this.updatedBooking?.remainingAmount,
      totalPayable:
        this.formService.paymentForm.getRawValue().totalPayable ||
        this.updatedBooking?.totalPayable,
      id: this.updatedBooking ? this.updatedBooking.id : null,
    };
    return formData as unknown as BookingDetails;
  }

  get startDate() {
    return this.formService.bookingInfoForm.controls.startDate.value;
  }

  editOrder() {
    this.router.navigate(['orders/add-new-order/edit'], {
      queryParams: {id: this.updatedBooking.id},
    });
  }

  changeStep(step: number) {
    this.formService.changeStep(step);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

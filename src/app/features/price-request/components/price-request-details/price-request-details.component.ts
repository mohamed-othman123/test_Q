import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {PriceRequest} from '../../models';
import {LanguageService} from '@core/services';
import {Item} from '@core/models';
import {PriceRequestService} from '../../services/price-request.service';
import {correctDateForTimezone, extractNationalPhoneNumber} from '@core/utils';
import {DatePickerComponent} from '@shared/components/date-picker/date-picker.component';

import {OrdersService} from '@orders/services/orders.service';
import {noDoubleSpaceValidator} from '@core/validators';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';

@Component({
    selector: 'app-price-request-details',
    templateUrl: './price-request-details.component.html',
    styleUrl: './price-request-details.component.scss',
    standalone: false
})
export class PriceRequestDetailsComponent implements OnInit {
  @ViewChild('datePicker') datePicker!: DatePickerComponent;

  mode: 'edit' | 'view' = 'view';

  disableEventDate = false;

  priceRequestData!: PriceRequest;

  priceRequestStatus: Item[] = [
    {
      'value': 'In Progress',
      'label': {
        'ar': 'قيد التنفيذ',
        'en': 'In Progress',
      },
    },
    {
      'value': 'Not Answered',
      'label': {
        'ar': 'لم يتم الرد',
        'en': 'Not Answered',
      },
    },
    {
      'value': 'Completed',
      'label': {
        'ar': 'مكتمل',
        'en': 'Completed',
      },
    },
  ];

  priceRequestForm = this.fb.group({
    name: [null, noDoubleSpaceValidator()],
    email: [null, Validators.email],
    phoneNumber: [null],
    eventTime: [null],
    eventName: [null, noDoubleSpaceValidator()],
    eventDate: [null, Validators.required],
    isFlexibleDate: [false],
    message: [null],
    status: [null, Validators.required],
    notes: [null, noDoubleSpaceValidator()],
  });

  eventTimeOptions: Item[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public lang: LanguageService,
    private router: Router,
    private priceRequestService: PriceRequestService,
    private ordersService: OrdersService,
  ) {}

  ngOnInit(): void {
    this.ordersService.getEventTimes().subscribe((data) => {
      this.eventTimeOptions = data;
    });

    this.route.data.subscribe((data) => {
      this.mode = data['mode'];
      this.priceRequestData = data['priceRequest'];

      this.populatePriceRequestForm();
    });
    this.isFlexibleDateListener();
  }

  isFlexibleDateListener() {
    this.getController('isFlexibleDate').valueChanges.subscribe((val) => {
      if (val) {
        this.disableEventDate = true;
        this.getController('eventDate').removeValidators(Validators.required);
        this.getController('eventDate').reset();
        this.datePicker.resetDateValue();
      } else {
        this.disableEventDate = false;
        this.datePicker.enableControl();
        this.getController('eventDate').setValidators(Validators.required);
      }
      this.getController('eventDate').updateValueAndValidity();
    });
  }

  getController(controlName: string) {
    return this.priceRequestForm.get(controlName) as FormControl;
  }

  populatePriceRequestForm() {
    this.getController('name').setValue(this.priceRequestData.name);

    this.getController('email').setValue(this.priceRequestData.email);

    this.getController('phoneNumber').setValue(
      extractNationalPhoneNumber(this.priceRequestData.phoneNumber),
    );

    this.getController('eventName').setValue(this.priceRequestData.eventName);
    this.getController('eventTime').setValue(this.priceRequestData.eventTime);

    this.getController('isFlexibleDate').setValue(
      this.priceRequestData.isFlexibleDate,
    );

    if (this.priceRequestData.isFlexibleDate) {
      this.disableEventDate = true;
      this.getController('eventDate').removeValidators(Validators.required);
    } else {
      this.getController('eventDate').setValue(this.priceRequestData.eventDate);
    }

    this.getController('message').setValue(this.priceRequestData.message);

    if (this.priceRequestData.status !== 'New') {
      this.getController('status').setValue(this.priceRequestData.status);
    }

    this.getController('notes').setValue(this.priceRequestData.notes);

    if (this.mode === 'view') {
      this.priceRequestForm.disable();
      this.getController('eventDate').disable();
    }
  }

  navigateToUpdate() {
    this.router.navigate(['/price-requests/edit', this.priceRequestData.id]);
  }

  cancel() {
    this.router.navigate(['/price-requests']);
  }

  createPriceRequestPayload(): Partial<PriceRequest> {
    const eventDate = dateToGregorianIsoString(
      this.getController('eventDate')?.value,
    );
    return {
      name: this.getController('name').value,
      email: this.getController('email').value,
      phoneNumber: this.getController('phoneNumber').value['e164Number'],
      eventName: this.getController('eventName').value,
      eventTime: this.getController('eventTime').value,
      eventDate: this.getController('eventDate')?.value ? eventDate : null,
      isFlexibleDate: this.getController('isFlexibleDate').value,
      message: this.getController('message').value,
      status: this.getController('status').value,
      notes: this.getController('notes').value,
    };
  }

  submit() {
    if (this.priceRequestForm.invalid) {
      this.priceRequestForm.markAllAsTouched();
      return;
    }
    const payload = this.createPriceRequestPayload();

    this.priceRequestService
      .updatePriceRequestById(this.priceRequestData.id, payload)
      .subscribe(() => {
        this.router.navigate(['/price-requests']);
      });
  }
}

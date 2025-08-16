import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SharedModule} from '@shared/shared.module';
import {LandingPageService} from '@core/services/landing-page.service';
import {SafeHtml} from '@angular/platform-browser';
import {LanguageService, NotificationService} from '@core/services';
import {Subscription} from 'rxjs';
import {DatePickerComponent} from '@shared/components/date-picker/date-picker.component';
import {Item} from '@core/models';
import {OrdersService} from '@orders/services/orders.service';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';
import moment from 'moment';

interface EventType {
  name: string;
}

@Component({
    selector: 'app-order-pricing',
    imports: [SharedModule],
    templateUrl: './order-pricing.component.html',
    styleUrl: './order-pricing.component.scss'
})
export class OrderPricingComponent implements OnInit, OnDestroy {
  @Input() hallData: any;
  @Output() close = new EventEmitter<void>();

  @ViewChild('datePicker') datePicker!: DatePickerComponent;

  today = moment().toISOString();

  pricingForm!: FormGroup;
  captchaSvg!: SafeHtml;
  captchaId!: string;
  showOtherEventInput = false;
  eventTypes: EventType[] = [];

  /** List of available event times types */
  eventTimeOptions: Item[] = [];

  subs = new Subscription();

  constructor(
    private landingPageService: LandingPageService,
    private notificationService: NotificationService,
    public lang: LanguageService,
    private ordersService: OrdersService,
  ) {
    this.initForm();
  }

  private initForm() {
    this.pricingForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(30),
        Validators.minLength(3),
        Validators.pattern(
          /^[\u0600-\u06FF\u0660-\u0669\sA-Za-z0-9\.\,\'\"\-\–\—\u060C\u061B\u061F\u0640]*$/,
        ),
      ]),
      eventName: new FormControl('', [Validators.required]),
      eventTime: new FormControl('', [Validators.required]),
      otherEventName: new FormControl('', [
        Validators.required,
        Validators.maxLength(30),
      ]),
      email: new FormControl('', [Validators.email]),
      phoneNumber: new FormControl('', [Validators.required]),
      eventDate: new FormControl(null, [Validators.required]),
      isFlexibleDate: new FormControl(false),
      message: new FormControl('', [
        Validators.maxLength(500),
        Validators.minLength(5),
      ]),
      captchaText: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    if (this.hallData?.hallEvents) {
      this.eventTypes = this.hallData.hallEvents.map((event: any) => ({
        name: event.name_ar,
      }));
      this.eventTypes.push({name: 'أخرى'});
    }

    this.loadCaptcha();

    this.isFlexibleDateListener();

    this.ordersService.getEventTimes().subscribe((data) => {
      this.eventTimeOptions = data;
    });
  }

  private loadCaptcha() {
    this.landingPageService.getCaptcha().subscribe((response) => {
      this.captchaSvg = response.svg;
      this.captchaId = response.captchaId;
    });
  }

  refreshCaptcha() {
    this.loadCaptcha();
  }

  onEventTypeChange(event: any) {
    this.showOtherEventInput = event === 'أخرى';

    if (this.showOtherEventInput) {
      this.pricingForm
        .get('otherEventName')
        ?.setValidators([Validators.required, Validators.maxLength(30)]);
    } else {
      this.pricingForm.get('otherEventName')?.clearValidators();
      this.pricingForm.get('otherEventName')?.setValue('');
    }
    this.pricingForm.get('otherEventName')?.updateValueAndValidity();
  }

  closePopup() {
    this.close.emit();
  }

  isFlexibleDateListener() {
    const sub = this.pricingForm
      .get('isFlexibleDate')
      ?.valueChanges.subscribe((val) => {
        if (val) {
          this.pricingForm.get('eventDate')?.disable();
          this.datePicker.resetDateValue();
        } else {
          this.pricingForm.get('eventDate')?.enable();
        }
      });

    this.subs.add(sub);
  }

  orderNow() {
    if (this.pricingForm.valid) {
      const formData = this.pricingForm.value;
      const requestData = {
        hallId: this.hallData.id,
        name: formData.name,
        email: formData.email,
        phoneNumber:
          formData.phoneNumber?.internationalNumber ||
          formData.phoneNumber?.e164Number ||
          '',
        eventName:
          formData.eventName === 'أخرى'
            ? formData.otherEventName
            : formData.eventName,
        eventDate: formData.eventDate
          ? dateToGregorianIsoString(formData.eventDate)
          : null,
        eventTime: formData.eventTime,
        isFlexibleDate: formData.isFlexibleDate,
        message: formData.message,
        captchaText: formData.captchaText,
        captchaId: this.captchaId,
      };

      this.landingPageService.submitPricingRequest(requestData).subscribe(
        () => {
          this.notificationService.showSuccess(
            'pricing.requestSubmittedSuccess',
          );
          this.closePopup();
        },
        () => {
          this.pricingForm.get('captchaText')?.setValue('');
          this.loadCaptcha();
        },
      );
    } else {
      Object.keys(this.pricingForm.controls).forEach((key) => {
        const control = this.pricingForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

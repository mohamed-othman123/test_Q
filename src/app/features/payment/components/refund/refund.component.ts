import {Component, Input} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {LanguageService} from '@core/services';
import {Booking} from '@orders/models';
import {Payment} from '@payment/models/payment.model';
import {PaymentMethod} from '@paymentmethods/models/payment.model';
import {CreateRefundRequestDto} from '@refund-requests/services/dto/create-refund.dto';
import {RefundRequestsService} from '@refund-requests/services/refund-request.service';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-refund',
  standalone: false,
  templateUrl: './refund.component.html',
  styleUrl: './refund.component.scss',
})
export class RefundComponent {
  @Input() paymentMethods: PaymentMethod[] = [];
  @Input() paymentDetails: Payment | null = null;
  @Input() bookingDetails!: Booking;
  @Input() paymentId: number | null = null;

  @Input() form!: FormGroup;

  subs = new Subscription();

  constructor(
    public lang: LanguageService,
    private router: Router,
    private refundRequestService: RefundRequestsService,
  ) {}

  getControl(name: string) {
    return this.form?.get(name) as FormControl;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.preparePayload();

    this.refundRequestService.createOne(payload).subscribe(() => {
      this.router.navigate(['details-and-payment', this.bookingDetails.id]);
    });
  }

  preparePayload(): CreateRefundRequestDto {
    const formValue = this.form.getRawValue();

    return {
      bookingId: formValue.bookingId,
      hallId: formValue.hallId,
      paymentMethodId: formValue.paymentMethod,
      amount: +formValue.amount,
      notes: formValue.notes,
      requestDate: dateToGregorianIsoString(formValue.requestDate, 'short')!,
      beneficiaryType: formValue.beneficiaryType,
      beneficiaryName: formValue.beneficiaryName,
      beneficiaryMobile: formValue.beneficiaryMobile.internationalNumber,
      clientPaymentMethod: {
        ...formValue.clientPaymentMethod,
        ewalletMobile: formValue.clientPaymentMethod.ewalletMobile
          ? formValue.clientPaymentMethod.ewalletMobile.internationalNumber
          : null,
      },
    };
  }

  navigateBack() {
    this.router.navigate(['details-and-payment', this.bookingDetails.id]);
  }
}

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {LanguageService} from '@core/services';
import {Booking} from '@orders/models';
import {Payment} from '@payment/models/payment.model';
import {PaymentService} from '@payment/services/payment.service';
import {PaymentMethod} from '@paymentmethods/models/payment.model';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-income',
  standalone: false,
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss',
})
export class IncomeComponent implements OnInit, OnDestroy {
  @Input() paymentMethods: PaymentMethod[] = [];
  @Input() paymentDetails: Payment | null = null;
  @Input() bookingDetails!: Booking;
  @Input() paymentId: number | null = null;

  @Input() form!: FormGroup;

  subs = new Subscription();

  constructor(
    public lang: LanguageService,
    private router: Router,
    private paymentService: PaymentService,
  ) {}

  ngOnInit(): void {
    this.paidAmountListener();
  }

  paidAmountListener() {
    const sub = this.getControl('amount').valueChanges.subscribe((val) => {
      if (!val) return;

      if (+val > 0) {
        const remainingAmount = this.bookingDetails?.remainingAmount - +val;

        if (+val <= this.bookingDetails?.remainingAmount) {
          this.getControl('remainingAmount').setValue(remainingAmount);
        } else {
          this.getControl('remainingAmount').setValue(0);
        }
      }
    });
    this.subs.add(sub);
  }

  getControl(name: string) {
    return this.form?.get(name) as FormControl;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.preparePayload();

    const request$ = this.paymentId
      ? this.paymentService.editPayment(this.paymentId, payload)
      : this.paymentService.addNewPayment(payload);

    const sub = request$.subscribe({
      next: () => {
        this.router.navigate(['details-and-payment', this.bookingDetails.id]);
      },
    });
  }

  preparePayload() {
    const formValue = this.form.getRawValue();
    return {
      bookingId: formValue.bookingId,
      paymentMethod: formValue.paymentMethod,
      paymentType: 'Income',
      amount: formValue.amount,
      notes: formValue.notes,
      paymentDate: dateToGregorianIsoString(formValue.paymentDate, 'short'),
      useGregorian: true,
      beneficiaryType: formValue.beneficiaryType,
      beneficiaryName: formValue.beneficiaryName,
      beneficiaryMobile: formValue.beneficiaryMobile.internationalNumber,
      clientPaymentMethod:
        formValue.beneficiaryType === 'other'
          ? {
              type: 'cash',
            }
          : undefined,
    };
  }

  navigateBack() {
    this.router.navigate(['details-and-payment', this.bookingDetails.id]);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

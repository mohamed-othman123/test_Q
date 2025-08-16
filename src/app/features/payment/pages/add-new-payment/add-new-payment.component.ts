import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Item} from '@core/models';
import {LanguageService} from '@core/services';
import {Payment} from '@payment/models/payment.model';
import {PaymentMethod} from '@paymentmethods/models/payment.model';
import {startWith, Subscription} from 'rxjs';
import {HallsService} from '@halls/services/halls.service';
import {Booking} from '@orders/models';
import {requiredIf, validateDoubleName} from '@core/validators';

import {TranslateService} from '@ngx-translate/core';
import {extractNationalPhoneNumber} from '@core/utils';

@Component({
  selector: 'app-add-new-payment',
  templateUrl: './add-new-payment.component.html',
  styleUrl: './add-new-payment.component.scss',
  standalone: false,
})
export class AddNewPaymentComponent implements OnInit, OnDestroy {
  paymentTypes: Item[];
  paymentMethods: PaymentMethod[];

  subs = new Subscription();

  paymentDetails: Payment | null = null;
  bookingId: number;
  bookingDetails!: Booking;
  operationType!: 'Refund' | 'Income';

  paymentId: number | null = null;
  hallId!: number;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public lang: LanguageService,
    private hallsService: HallsService,
    public translateService: TranslateService,
  ) {
    const resolvedData = route.snapshot.data['resolvedData'];
    this.paymentTypes = resolvedData.paymentTypes;
    this.paymentMethods = resolvedData.paymentMethods.items;
    this.paymentDetails = resolvedData.payment;
    this.bookingDetails = resolvedData.bookingDetails;
    this.bookingId = +route.snapshot.params['id'];

    this.paymentId = route.snapshot.queryParams['paymentId'] ?? null;

    this.operationType = this.route.snapshot.queryParams['type'] || 'Income';

    this.hallId = this.hallsService.getCurrentHall()?.id!;
  }

  ngOnInit(): void {
    this.initForm();

    if (this.paymentId) {
      this.patchFormValues(this.paymentDetails!);
    }
    this.beneficiaryTypeListener();
  }

  getControl(name: string): FormControl {
    return this.form?.get(name) as FormControl;
  }

  initForm() {
    this.form = this.fb.group({
      bookingId: [this.bookingId],
      hallId: [this.hallId],
      paymentMethod: [null, [Validators.required]],
      // bank: [null],
      paymentType: [this.operationType, Validators.required],
      amount: [null, Validators.required],
      notes: [''],
      paymentDate: [null, [requiredIf(() => this.operationType === 'Income')]],
      requestDate: [null, [requiredIf(() => this.operationType === 'Refund')]],
      useGregorian: [true],
      beneficiaryType: ['customer', Validators.required],
      beneficiaryName: [null, [Validators.required, validateDoubleName()]],
      beneficiaryMobile: [null, Validators.required],
      remainingAmount: [this.bookingDetails?.remainingAmount], //helper control
      clientPaymentMethod: this.fb.group({
        type: [null],
        bankName: [null],
        accountNumber: [null, [Validators.minLength(15)]],
        iban: [null, [Validators.pattern(/^SA[0-9]{2}[0-9]{20}$/)]],
        ewalletName: [null],
        ewalletMobile: [null],
      }),
      refundRequestId: this.fb.group({
        type: [null],
        bankName: [null],
        accountNumber: [null],
        iban: [null],
        ewalletName: [null],
        ewalletMobile: [null],
      }),
    });
  }

  patchFormValues(payment: Payment) {
    this.form.patchValue({
      bookingId: payment.booking.id,
      paymentMethod: payment.paymentMethod.id,
      paymentType: payment.paymentType,
      amount: payment.amount,
      notes: payment.notes,
      paymentDate: payment.paymentDate,
      beneficiaryType: payment.beneficiaryType || 'customer',
      beneficiaryName: payment.beneficiary_name,
      beneficiaryMobile: payment.beneficiary_mobile,
      remainingAmount: this.bookingDetails?.remainingAmount,
    });
  }

  beneficiaryTypeListener() {
    const sub = this.getControl('beneficiaryType')
      .valueChanges.pipe(startWith(this.getControl('beneficiaryType').value))
      .subscribe((val) => {
        switch (val) {
          case 'customer':
            const phone = extractNationalPhoneNumber(
              this.bookingDetails?.user.phone,
            );
            this.form.patchValue({
              beneficiaryName: this.bookingDetails?.user.name,
              beneficiaryMobile: phone,
            });
            this.getControl('beneficiaryName').disable();
            this.getControl('beneficiaryMobile').disable();
            break;
          case 'other':
            if (this.paymentId) return;

            this.form.patchValue({
              beneficiaryName: '',
              beneficiaryMobile: '',
            });
            this.getControl('beneficiaryName').enable();
            this.getControl('beneficiaryMobile').enable();
            break;
        }
        this.getControl('beneficiaryName').updateValueAndValidity();
        this.getControl('beneficiaryMobile').updateValueAndValidity();
      });
    this.subs.add(sub);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}

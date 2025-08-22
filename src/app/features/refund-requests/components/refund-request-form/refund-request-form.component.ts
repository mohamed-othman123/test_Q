import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BANKS_DATA, E_WALLETS, PAYMENT_METHOD_TYPES} from '@core/constants';
import {Item} from '@core/models';
import {extractNationalPhoneNumber} from '@core/utils';
import {
  noDoubleSpaceValidator,
  requireOneOf,
  validateDoubleName,
} from '@core/validators';
import {PaymentMethod} from '@paymentmethods/models/payment.model';
import {RefundStatusTypes} from '@refund-requests/constants/refund-status.constant';
import {
  PaymentMethodType,
  RefundRequest,
} from '@refund-requests/models/refund-request.model';
import {UpdateRefundRequestDto} from '@refund-requests/services/dto/update-refund.dto';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'refund-request-form',
  templateUrl: './refund-request-form.component.html',
  styleUrls: ['./refund-request-form.component.scss'],
  standalone: false,
})
export class RefundRequestFormComponent implements OnInit, OnDestroy {
  @Input() refundRequest!: RefundRequest;
  @Input() paymentMethods!: PaymentMethod[];
  @Input() lang!: string;
  @Output() onSubmit: EventEmitter<UpdateRefundRequestDto>;

  form!: FormGroup;

  maxDate: Date = new Date();

  banks: Item[] = BANKS_DATA;
  paymentMethodTypes: Item[] = PAYMENT_METHOD_TYPES;
  eWallets: Item[] = E_WALLETS;

  statusOptions: Item[] = RefundStatusTypes;

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.onSubmit = new EventEmitter();
  }

  ngOnInit(): void {
    console.log(this.refundRequest);
    this.initializeForm();
    this.setupFormValueChanges();
    this.patchFormValues();
    this.statusChangeListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    const clientPaymentMethod = {
      type: formValue.clientPaymentType,
      bankName: formValue.bank_name,
      accountNumber: formValue.account_number,
      iban: formValue.iban,
      ewalletName: formValue.ewallet_name,
      ewalletMobile: formValue.ewallet_mobile?.internationalNumber,
    };

    const requestData = {
      paymentMethodId: formValue.paymentMethod,
      amount: +formValue.amount,
      requestDate: dateToGregorianIsoString(
        formValue.requestDate as unknown as string,
      ),
      notes: formValue.notes,
      clientPaymentMethod,
      beneficiaryType: formValue.beneficiary_type,
      beneficiaryName: formValue.beneficiary_name,
      beneficiaryMobile: formValue.beneficiary_mobile.internationalNumber,
      status: formValue.status,
      rejectReason: formValue.rejectReason,
    };

    this.onSubmit.emit(requestData);
  }

  navigateToUpdate() {}

  cancel() {}

  isCashSelected(): boolean {
    return this.form?.value.clientPaymentType === PaymentMethodType.CASH;
  }

  isBankAccountSelected(): boolean {
    return (
      this.form?.value.clientPaymentType === PaymentMethodType.BANK_ACCOUNT
    );
  }

  isEWalletSelected(): boolean {
    return this.form?.value.clientPaymentType === PaymentMethodType.E_WALLET;
  }

  isPosSelected(): boolean {
    return this.form?.value.clientPaymentType === PaymentMethodType.POS;
  }

  private initializeForm() {
    this.form = this.fb.group(
      {
        // Basic fields
        paymentMethod: [null, Validators.required],
        amount: [
          null as string | null,
          [Validators.required, Validators.min(0)],
        ],
        status: [null, Validators.required],
        requestDate: [null, Validators.required],
        notes: [null, [noDoubleSpaceValidator()]],
        rejectReason: [null, []],

        // Beneficiary fields
        beneficiary_type: ['customer', Validators.required],
        beneficiary_name: [null, [Validators.required, validateDoubleName()]],
        beneficiary_mobile: [null, Validators.required],

        // Client payment method fields
        clientPaymentType: [null, Validators.required],
        bank_name: [null],
        account_number: [null],
        iban: [null],
        ewallet_name: [null],
        ewallet_mobile: [null],
      },
      {validators: [requireOneOf(['iban', 'account_number'])]},
    );
  }

  private setupFormValueChanges() {
    this.form
      .get('clientPaymentType')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((type) => {
        this.updateValidationBasedOnType(type);
      });

    this.form
      .get('beneficiary_type')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((type) => {
        const phone = extractNationalPhoneNumber(
          this.refundRequest.user.phone || '',
        );

        if (type === 'customer') {
          this.form
            .get('beneficiary_name')
            ?.setValue(this.refundRequest.user.name);
          this.form.get('beneficiary_mobile')?.setValue(phone);
          this.form.get('beneficiary_name')?.disable();
          this.form.get('beneficiary_mobile')?.disable();
        } else {
          // Clear fields when 'other' is selected
          this.form.get('beneficiary_name')?.setValue(null);
          this.form.get('beneficiary_mobile')?.setValue(null);

          this.form.get('beneficiary_name')?.enable();
          this.form.get('beneficiary_mobile')?.enable();
        }
      });
  }

  private updateValidationBasedOnType(type: PaymentMethodType) {
    // Reset all payment method fields
    this.form.get('bank_name')?.clearValidators();
    this.form.get('account_number')?.clearValidators();
    this.form.get('iban')?.clearValidators();
    this.form.get('ewallet_name')?.clearValidators();
    this.form.get('ewallet_mobile')?.clearValidators();
    this.form.clearValidators();

    this.form.get('bank_name')?.setValue(null);
    this.form.get('account_number')?.setValue(null);
    this.form.get('iban')?.setValue(null);
    this.form.get('ewallet_name')?.setValue(null);
    this.form.get('ewallet_mobile')?.setValue(null);

    // Apply validators based on selected type
    switch (type) {
      case PaymentMethodType.BANK_ACCOUNT:
        this.form.get('bank_name')?.setValidators([Validators.required]);
        this.form
          .get('account_number')
          ?.setValidators([Validators.minLength(15)]);
        this.form
          .get('iban')
          ?.setValidators([Validators.pattern(/^SA[0-9]{2}[0-9]{20}$/)]);
        this.form.get('bank_name')?.updateValueAndValidity();
        this.form.setValidators(requireOneOf(['account_number', 'iban']));

        break;
      case PaymentMethodType.E_WALLET:
        this.form.get('ewallet_name')?.setValidators([Validators.required]);
        this.form.get('ewallet_mobile')?.setValidators([Validators.required]);
        this.form.get('ewallet_name')?.updateValueAndValidity();
        this.form.get('ewallet_mobile')?.updateValueAndValidity();
        break;
    }

    // Update validators
    this.form.updateValueAndValidity();
  }

  private patchFormValues() {
    const beneficiaryMobile = extractNationalPhoneNumber(
      this.refundRequest.beneficiaryMobile || '',
    );
    // Patch basic fields
    this.form.patchValue({
      paymentMethod: this.refundRequest.paymentMethod.id,
      status: this.refundRequest.status,
      amount: this.refundRequest.amount,
      requestDate: this.refundRequest.request_date,
      notes: this.refundRequest.notes,
      rejectReason: this.refundRequest.rejectReason,

      // Patch beneficiary fields
      beneficiary_type: this.refundRequest.beneficiaryType || 'customer',
      beneficiary_name: this.refundRequest.beneficiaryName,
      beneficiary_mobile: beneficiaryMobile,
    });

    // Patch client payment method fields if available
    if (this.refundRequest.clientPaymentMethod) {
      const clientPaymentMethod = this.refundRequest.clientPaymentMethod;
      const ewalletMobile = extractNationalPhoneNumber(
        clientPaymentMethod.ewallet_mobile || '',
      );

      this.form.patchValue({
        clientPaymentType: clientPaymentMethod.type,
        bank_name: clientPaymentMethod.bank_name,
        account_number: clientPaymentMethod.account_number,
        iban: clientPaymentMethod.iban,
        ewallet_name: clientPaymentMethod.ewallet_name,
        ewallet_mobile: ewalletMobile,
      });
    }
  }

  statusChangeListener() {
    this.form
      .get('status')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        if (status === 'rejected') {
          this.form.get('rejectReason')?.setValidators([Validators.required]);
        } else {
          this.form.get('rejectReason')?.clearValidators();
        }
        this.form.get('rejectReason')?.updateValueAndValidity();
      });
  }
}

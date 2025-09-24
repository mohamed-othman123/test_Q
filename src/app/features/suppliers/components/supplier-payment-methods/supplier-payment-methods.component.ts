import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {BANKS_DATA, E_WALLETS, PAYMENT_METHOD_TYPES} from '@core/constants';
import {Item} from '@core/models';
import {LanguageService} from '@core/services';
import {extractNationalPhoneNumber} from '@core/utils';
import {requireOneOf} from '@core/validators';
import {Supplier, SupplierPaymentMethod} from '@suppliers/models/supplier';

@Component({
  selector: 'app-supplier-payment-methods',
  templateUrl: './supplier-payment-methods.component.html',
  styleUrl: './supplier-payment-methods.component.scss',
  standalone: false,
})
export class SupplierPaymentMethodsComponent implements OnInit, OnChanges {
  @Input() paymentMethods!: FormArray;
  @Input() supplier: Supplier | null = null;

  banks: Item[] = BANKS_DATA;
  paymentMethodTypes: Item[] = PAYMENT_METHOD_TYPES;
  eWallets: Item[] = E_WALLETS;

  mode: 'add' | 'edit' | 'view' = 'add';

  constructor(
    private fb: FormBuilder,
    public lang: LanguageService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];

    if (this.mode === 'add') {
      this.addPaymentMethod();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['supplier'] && this.supplier) {
      this.paymentMethods.clear();
      this.populatePaymentMethodsArray();
      this.paymentMethods.disable();
    }
  }

  createPaymentMethod(data?: SupplierPaymentMethod): FormGroup {
    const phone = extractNationalPhoneNumber(data?.eWalletPhone || '');
    return this.fb.group({
      id: [data?.id || null],
      name: [data?.name || null, [Validators.required]],
      paymentMethodType: [
        data?.paymentMethodType || null,
        [Validators.required],
      ],
      bankName: [data?.bankName || null],
      IBAN: [data?.IBAN || null, Validators.pattern(/^SA[0-9]{2}[0-9]{20}$/)],
      accountNumber: [data?.accountNumber || null, [Validators.minLength(15)]],
      eWalletName: [data?.eWalletName || null],
      eWalletPhone: [phone || null],
      paymentMethodNotes: [data?.paymentMethodNotes || null],
    });
  }

  populatePaymentMethodsArray() {
    const paymentMethods = this.supplier?.paymentMethods || [];

    paymentMethods.forEach((method) => {
      this.paymentMethods.push(this.createPaymentMethod(method));
    });

    if (this.mode === 'view') {
      this.paymentMethods.disable();
    }
  }

  addPaymentMethod() {
    this.paymentMethods.push(this.createPaymentMethod());
  }

  onPaymentMethodTypeChange(event: any, index: number) {
    const form = this.paymentMethods.at(index) as FormGroup;

    if (!form) return;

    this.clearAllValidator(form);

    switch (event) {
      case 'bankAccount':
        form.get('bankName')?.setValidators([Validators.required]);
        form.get('bankName')?.updateValueAndValidity({onlySelf: true});
        form.setValidators(requireOneOf(['accountNumber', 'IBAN']));
        break;
      case 'eWallet':
        form.get('eWalletName')?.setValidators(Validators.required);
        form.get('eWalletName')?.updateValueAndValidity({onlySelf: true});
        form.get('eWalletPhone')?.setValidators(Validators.required);
        form.get('eWalletPhone')?.updateValueAndValidity({onlySelf: true});

        break;
      case 'pos':
      case 'cash':
        break;
    }

    form.updateValueAndValidity();
  }

  clearAllValidator(form: FormGroup) {
    form.clearValidators();

    Object.keys(form.controls).forEach((key) => {
      if (key === 'name') return;

      const control = form.get(key)!;

      control.removeValidators([Validators.required]);
      control.updateValueAndValidity({onlySelf: true});
    });

    form.updateValueAndValidity({onlySelf: true});
  }

  deleteMethod(index: number) {
    this.paymentMethods.removeAt(index);
    if (this.paymentMethods.length === 0) {
      this.addPaymentMethod();
    }
  }
}

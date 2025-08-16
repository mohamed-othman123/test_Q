import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';
import {BANKS_DATA, E_WALLETS, PAYMENT_METHOD_TYPES} from '@core/constants';
import {Item} from '@core/models';
import {LanguageService} from '@core/services';
import {requireOneOf} from '@core/validators';

@Component({
  selector: 'app-client-payment-methods',
  standalone: false,
  templateUrl: './client-payment-methods.component.html',
  styleUrl: './client-payment-methods.component.scss',
})
export class ClientPaymentMethodsComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;

  banks: Item[] = BANKS_DATA;
  paymentMethodTypes: Item[] = PAYMENT_METHOD_TYPES;
  eWallets: Item[] = E_WALLETS;

  constructor(public lang: LanguageService) {}

  ngOnInit(): void {
    this.form.get('type')?.addValidators([Validators.required]);
    this.form.get('type')?.updateValueAndValidity();
  }

  onPaymentMethodTypeChange(event: any) {
    this.clearAllValidator(this.form);

    switch (event) {
      case 'bankAccount':
        this.form.get('bankName')?.setValidators([Validators.required]);
        this.form.get('bankName')?.updateValueAndValidity({onlySelf: true});
        this.form.setValidators(requireOneOf(['accountNumber', 'iban']));
        break;
      case 'eWallet':
        this.form.get('ewalletName')?.setValidators(Validators.required);
        this.form.get('ewalletName')?.updateValueAndValidity({onlySelf: true});
        this.form.get('ewalletMobile')?.setValidators(Validators.required);
        this.form
          .get('ewalletMobile')
          ?.updateValueAndValidity({onlySelf: true});

        break;
      case 'pos':
      case 'cash':
        break;
    }

    this.form.updateValueAndValidity();
  }

  clearAllValidator(form: FormGroup) {
    form.clearValidators();
    form.patchValue({
      bankName: null,
      accountNumber: null,
      iban: null,
      ewalletMobile: null,
      ewalletName: null,
    });

    Object.keys(form.controls).forEach((key) => {
      if (key === 'name') return;

      const control = form.get(key)!;

      control.removeValidators([Validators.required]);
      control.updateValueAndValidity({onlySelf: true});
    });

    form.updateValueAndValidity({onlySelf: true});
  }

  ngOnDestroy(): void {
    this.form.get('type')?.removeValidators([Validators.required]);
    this.form.get('type')?.updateValueAndValidity();
  }
}

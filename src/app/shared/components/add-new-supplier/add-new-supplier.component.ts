import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {BANKS_DATA, E_WALLETS, PAYMENT_METHOD_TYPES} from '@core/constants';
import {Item} from '@core/models';
import {ParsedPhoneNumber} from '@core/models/ParsedPhoneNumber';
import {LanguageService} from '@core/services';
import {DrawerService} from '@core/services/drawer.service';
import {
  noDoubleSpaceValidator,
  requireOneOf,
  validateDoubleName,
} from '@core/validators';
import {Hall} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';

import {
  SupplierPaymentMethod,
  SupplierProduct,
} from '@suppliers/models/supplier';
import {SuppliersService} from '@suppliers/services/suppliers.service';

@Component({
  selector: 'app-add-new-supplier',
  templateUrl: './add-new-supplier.component.html',
  styleUrl: './add-new-supplier.component.scss',
  standalone: false,
})
export class AddNewSupplierComponent implements OnInit {
  form!: FormGroup;
  currentHall: Hall | null = null;

  @Output() createdSupplier = new EventEmitter();

  banks: Item[] = BANKS_DATA;
  paymentMethodTypes: Item[] = PAYMENT_METHOD_TYPES;
  eWallets: Item[] = E_WALLETS;

  constructor(
    private fb: FormBuilder,
    private suppliersService: SuppliersService,
    private hallsService: HallsService,
    private drawerService: DrawerService,
    public lang: LanguageService,
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.currentHall = this.hallsService.getCurrentHall();
    this.addPaymentMethod();
  }

  private initForm() {
    this.form = this.fb.group({
      name: [
        '',
        [Validators.required, validateDoubleName(), noDoubleSpaceValidator()],
      ],
      phone: [null as string | null, [Validators.required]],
      commercialRegistrationNumber: [
        '',
        [
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern(/^[1-9]\d{9}$/),
          noDoubleSpaceValidator(),
        ],
      ],
      taxRegistrationNumber: [
        '',
        [
          Validators.minLength(15),
          Validators.maxLength(15),
          Validators.pattern(/^[1-9]\d{14}$/),
          noDoubleSpaceValidator(),
        ],
      ],
      email: ['', [Validators.email]],
      address: ['', noDoubleSpaceValidator()],
      activity: ['', noDoubleSpaceValidator()],
      active: [true],
      note: ['', noDoubleSpaceValidator()],
      paymentMethods: this.fb.array([]),
      products: [[] as SupplierProduct[]],
    });
  }

  get paymentMethods() {
    return this.form.get('paymentMethods') as FormArray;
  }

  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  addPaymentMethod() {
    this.paymentMethods.push(this.createPaymentMethod());
  }

  createPaymentMethod(): FormGroup {
    return this.fb.group({
      name: [null, [Validators.required]],
      paymentMethodType: [null, [Validators.required]],
      bankName: [null],
      IBAN: [null],
      accountNumber: [null, [Validators.minLength(15)]],
      eWalletName: [null],
      eWalletPhone: [null],
      paymentMethodNotes: [null],
    });
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
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const paymentMethods = this.form
      .get('paymentMethods')
      ?.value.map((method: SupplierPaymentMethod) => {
        return {
          ...method,
          eWalletPhone: method.eWalletPhone
            ? (method.eWalletPhone as any).internationalNumber
            : null,
        };
      });

    const formValue = {
      ...this.form.value,
      active: true,
      paymentMethods,
      halls: [{id: this.currentHall?.id}],
    };

    if (this.getControl('phone').dirty && formValue.phone) {
      formValue.phone = (
        formValue.phone as unknown as ParsedPhoneNumber
      ).internationalNumber;
    }

    this.suppliersService.createSupplier(formValue).subscribe((res) => {
      this.createdSupplier.emit(res);
      this.drawerService.close();
    });
  }
}

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PurchaseModel} from '@purchases/models/purchase-model';
import {Supplier} from '@suppliers/models/supplier';
import {Item} from '@core/models';
import {startWith, Subject} from 'rxjs';
import {LanguageService} from '@core/services';
import {PaymentMethod} from '@paymentmethods/models/payment.model';
import {ExpensesItem} from '@expenses-items/models';
import {PAYMENT_TYPES} from '@purchases/constants/purchase.constants';

import {extractNationalPhoneNumber} from '@core/utils';
import {Router} from '@angular/router';
import {BANKS_DATA, E_WALLETS, PAYMENT_METHOD_TYPES} from '@core/constants';

@Component({
  selector: 'app-purchase-payment-form',
  templateUrl: './purchase-payment-form.component.html',
  styleUrls: ['./purchase-payment-form.component.scss'],
  standalone: false,
})
export class PurchasePaymentFormComponent implements OnInit, OnDestroy {
  @Input() parentForm?: FormGroup;
  @Input() purchase: PurchaseModel | null = null;
  @Input() supplier: Supplier | null = null;
  @Input() expenseItem: ExpensesItem | null = null;
  @Input() paymentMethods: PaymentMethod[] = [];
  @Input() isEditMode!: boolean;

  @Input() set paymentForm(form: FormGroup) {
    this._paymentForm = form;
  }

  @Output() onCancel = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<void>();

  banks: Item[] = BANKS_DATA;
  paymentMethodTypes: Item[] = PAYMENT_METHOD_TYPES;
  eWallets: Item[] = E_WALLETS;

  paymentTypes: Item[] = [];

  private _paymentForm!: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    public lang: LanguageService,
    private cd: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setPaymentType();

    this.paymentDate?.valueChanges.subscribe(() => {
      this.cd.detectChanges();
    });

    this.addHelperControls();

    this.expenseItemAccountListener();
    this.supplierAccountListener();

    this.handelRequiredFields();
  }

  get paymentForm(): FormGroup {
    return this._paymentForm;
  }

  get paymentDate() {
    return this.paymentForm.get('paymentDate') as FormControl;
  }

  setPaymentType() {
    if (this.purchase?.paidAmount! === 0) {
      this.paymentTypes = PAYMENT_TYPES.filter((ele) => ele.value === 'Income');
    } else {
      this.paymentTypes = PAYMENT_TYPES;
    }
  }

  handelRequiredFields() {
    if (this.purchase?.expenseItem) {
      this.paymentForm
        .get('itemTransferAccountId')
        ?.addValidators(Validators.required);
      this.paymentForm.get('itemTransferAccountId')?.updateValueAndValidity();
    } else if (this.purchase?.supplier) {
      this.paymentForm
        .get('supplierPaymentMethodId')
        ?.addValidators(Validators.required);
      this.paymentForm.get('itemTransferAccountId')?.updateValueAndValidity();
    }
  }

  addHelperControls() {
    this.paymentForm.addControl(
      'expenseAccountNumber',
      new FormControl({disabled: true, value: null}),
    );

    this.paymentForm.addControl(
      'paymentMethodType',
      new FormControl({disabled: true, value: null}),
    );

    this.paymentForm.addControl(
      'eWalletName',
      new FormControl({disabled: true, value: null}),
    );

    this.paymentForm.addControl(
      'eWalletPhone',
      new FormControl({disabled: true, value: null}),
    );

    this.paymentForm.addControl(
      'eWalletOriginalPhone',
      new FormControl({disabled: true, value: null}),
    );

    this.paymentForm.addControl(
      'bankName',
      new FormControl({disabled: true, value: null}),
    );

    this.paymentForm.addControl(
      'IBAN',
      new FormControl({disabled: true, value: null}),
    );
    this.paymentForm.addControl(
      'accountNumber',
      new FormControl({disabled: true, value: null}),
    );
  }

  expenseItemAccountListener() {
    this.paymentForm
      .get('itemTransferAccountId')
      ?.valueChanges.pipe(
        startWith(this.paymentForm.get('itemTransferAccountId')?.value),
      )
      .subscribe((val) => {
        const selectedExpenseAccount = this.expenseItem?.transferAccounts?.find(
          (acc) => acc.id === val,
        )!;
        this.paymentForm
          .get('expenseAccountNumber')
          ?.setValue(selectedExpenseAccount?.accountNumber, {emitEvent: false});
      });
  }

  supplierAccountListener() {
    this.paymentForm
      .get('supplierPaymentMethodId')
      ?.valueChanges.pipe(
        startWith(this.paymentForm.get('supplierPaymentMethodId')?.value),
      )
      .subscribe((val) => {
        const selectedAccount = this.supplier?.paymentMethods.find(
          (acc) => acc.id === val,
        )!;

        const phone = extractNationalPhoneNumber(selectedAccount?.eWalletPhone);
        this.paymentForm.patchValue(
          {
            paymentMethodType: selectedAccount?.paymentMethodType,
            eWalletName: selectedAccount?.eWalletName,
            eWalletPhone: phone,
            eWalletOriginalPhone: selectedAccount?.eWalletPhone,
            bankName: selectedAccount?.bankName,
            IBAN: selectedAccount?.IBAN,
            accountNumber: selectedAccount?.accountNumber,
          },
          {emitEvent: false},
        );
      });
  }

  navigateToSupplier(supplierId: any) {
    this.router.navigate(['suppliers', 'edit', supplierId]);
  }
  navigateToExpenseItem(expenseItemId: any) {
    this.router.navigate(['expenses-items', 'edit', expenseItemId]);
  }

  cancel() {
    this.onCancel.emit();
  }

  submit() {
    this.onSubmit.emit();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

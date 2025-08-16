import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {TransferAccounts} from '@expenses-items/models';

@Component({
  selector: 'app-expense-accounts',
  templateUrl: './expense-accounts.component.html',
  styleUrl: './expense-accounts.component.scss',
  standalone: false,
})
export class ExpenseAccountsComponent implements OnInit {
  @Input() accounts!: FormArray;

  mode: 'add' | 'edit' | 'view' = 'add';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    const {item} = this.route.snapshot.data['data'];
    this.mode = this.route.snapshot.data['mode'];

    if (this.mode === 'add') {
      this.addExpenseAccount();
    }

    if (this.mode !== 'add' && item) {
      this.populatePaymentMethodsArray(item.transferAccounts);
    }

    if (this.mode === 'edit') {
      this.accounts.disable();
    }
  }

  createAccountForm(data?: TransferAccounts): FormGroup {
    return this.fb.group({
      id: [data?.id || null],
      accountName: [data?.accountName || null, [Validators.required]],
      accountNumber: [
        data?.accountNumber || null,
        [Validators.required, Validators.minLength(15)],
      ],
      description: [data?.description || null],
    });
  }

  populatePaymentMethodsArray(accounts: TransferAccounts[]) {
    accounts.forEach((account) => {
      this.accounts.push(this.createAccountForm(account));
    });

    if (this.mode === 'view') {
      this.accounts.disable();
    }
  }

  addExpenseAccount() {
    this.accounts.push(this.createAccountForm());
  }

  deleteAccount(index: number) {
    this.accounts.removeAt(index);

    if (this.accounts.length === 0) {
      this.addExpenseAccount();
    }
  }
}

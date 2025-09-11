import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {AccountData, AccountNode} from '@accounts/models/accounts';
import {AccountsService} from '@accounts/services/accounts.service';
import {FormMode} from '@core/models';
import {DrawerService} from '@core/services/drawer.service';
import {requireOneOf} from '@core/validators';
import {debounceTime, startWith, Subscription} from 'rxjs';
import {generateAccountCode} from '@accounts/utils/generate-account-code';

@Component({
  selector: 'app-add-new-account',
  standalone: false,
  templateUrl: './add-new-account.component.html',
  styleUrl: './add-new-account.component.scss',
})
export class AddNewAccountComponent implements OnInit {
  @Output() refreshData = new EventEmitter<void>();

  form = this.fb.group(
    {
      parentAccountId: [null, [Validators.required]],
      name: [null, [Validators.required]],
      name_ar: [null, [Validators.required]],
      isParent: [null, [Validators.required]],
      accountCode: [null, [Validators.required]],
      accountType: [null],
      openingDebit: [0, [Validators.min(0)]],
      openingCredit: [0, [Validators.min(0)]],
      description: [null],
    },
    {validators: [requireOneOf(['name', 'name_ar'])]},
  );

  mode: FormMode = 'add';
  account: AccountData | undefined = undefined;
  parentAccount: AccountNode | undefined = undefined;

  parentsList: AccountData[] = [];

  subs = new Subscription();

  constructor(
    private drawerService: DrawerService,
    private fb: FormBuilder,
    private accountsService: AccountsService,
  ) {}

  ngOnInit(): void {
    const drawerSub = this.drawerService.drawerState$.subscribe((state) => {
      if (state.visible) {
        this.mode = state.mode;
        const {account, parentAccount} = state.data || {};
        this.account = account;
        this.parentAccount = parentAccount;
        this.getAccountsList();
        this.patchFormValue(this.account, this.parentAccount);
      } else {
        this.cleanup();
      }
    });
    this.subs.add(drawerSub);

    this.autoGenerateAccountCode();
  }

  patchFormValue(account?: AccountData, parentAccount?: AccountNode) {
    if (parentAccount) {
      this.getControl('parentAccountId').setValue(parentAccount);
    }
    if (account && this.mode === 'edit') {
      this.form.patchValue(account as any);
      this.getControl('parentAccountId').setValue(
        account.parent ? account.parent : null,
      );
    }
  }

  getAccountsList() {
    this.accountsService.getAccountList({}).subscribe((res) => {
      this.parentsList = this.filterAccounts(res.items);
    });
  }

  filterAccounts(accounts: AccountData[]) {
    return accounts.filter((acc) => acc.parent !== null && acc.isParent);
  }

  cleanup() {
    this.form.reset();
    this.account = undefined;
    this.parentAccount = undefined;
  }

  getControl(name: string): FormControl {
    return this.form?.get(name) as FormControl;
  }

  //generate the account code based on the parent account code
  autoGenerateAccountCode() {
    this.subs.add(
      this.getControl('parentAccountId')
        .valueChanges.pipe(
          startWith(this.getControl('parentAccountId').value),
          debounceTime(300),
        )
        .subscribe((val: AccountData) => {
          if (val?.accountLevel! >= 2) {
            const code = generateAccountCode(val);
            this.getControl('accountCode').setValue(code);
          }

          this.getControl('accountType').setValue(val?.accountType || null);
        }),
    );
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const formValue = this.preparePayload();

    const request$ =
      this.mode === 'add'
        ? this.accountsService.createNewAccount(formValue)
        : this.accountsService.updateAccount(this.account!.id!, formValue);

    request$.subscribe({
      next: (res) => {
        this.drawerService.close();
        this.refreshData.emit();
      },
    });
  }

  preparePayload(): AccountData {
    const value = this.form.value;
    return {
      parentAccountId: value.parentAccountId?.['id'],
      name: value.name!,
      name_ar: value.name_ar!,
      accountCode: value.accountCode!,
      accountType: value.accountType!,
      isParent: value.isParent!,
      openingDebit: value.openingDebit ? +value.openingDebit : 0,
      openingCredit: value.openingCredit ? +value.openingCredit : 0,
      description: value.description!,
    };
  }
}

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {DrawerService} from '@core/services/drawer.service';
import {requireOneOf} from '@core/validators';
import {ExpensesItemsService} from '@expenses-items/services/expenses-items.service';
import {Hall} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {PurchaseCategory} from '@purchase-categories/models/purchase-category.model';
import {Subject, takeUntil} from 'rxjs';

@Component({
    selector: 'app-add-new-expense-item',
    templateUrl: './add-new-expense-item.component.html',
    styleUrl: './add-new-expense-item.component.scss',
    standalone: false
})
export class AddNewExpenseItemComponent implements OnInit, OnDestroy {
  @Input() categories!: PurchaseCategory[];

  @Output() expenseItemCreated = new EventEmitter();

  form!: FormGroup;

  currentHall: Hall | null = null;

  destroy$ = new Subject<void>();

  get accounts() {
    return this.form.get('transferAccounts') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private hallsService: HallsService,
    private expensesItemsService: ExpensesItemsService,
    private drawerService: DrawerService,
  ) {}

  ngOnInit(): void {
    this.hallsService.currentHall$.subscribe((hall) => {
      this.currentHall = hall;
    });

    this.initializeForm();
  }

  initializeForm() {
    this.form = this.fb.group(
      {
        categoryId: [null, Validators.required],
        name: [null, Validators.required],
        nameAr: [null, Validators.required],
        description: [null],
        transferAccounts: this.fb.array([]),
      },
      {validators: [requireOneOf(['name', 'nameAr'])]},
    );

    this.addNewExpenseAccount();
  }

  getControl(controlName: string) {
    return this.form.get(controlName) as FormControl;
  }

  addNewExpenseAccount() {
    this.accounts.push(this.createExpenseAccountForm());
  }

  createExpenseAccountForm() {
    return this.fb.group({
      accountName: [null, Validators.required],
      accountNumber: [null, Validators.required],
      description: [null],
    });
  }

  deleteAccount(index: number) {
    this.accounts.removeAt(index);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = {
      ...this.form.value,
      hallId: this.currentHall?.id,
      elements: [],
    };

    this.expensesItemsService
      .addExpenseItem(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.expenseItemCreated.emit(res);
        this.drawerService.close();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {LanguageService} from '@core/services';
import {requireOneOf} from '@core/validators';
import {ExpensesItem} from '@expenses-items/models';
import {ExpensesItemsService} from '@expenses-items/services/expenses-items.service';
import {HallsService} from '@halls/services/halls.service';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-expense-item-form',
  templateUrl: './expense-item-form.component.html',
  styleUrl: './expense-item-form.component.scss',
  standalone: false,
})
export class ExpenseItemFormComponent implements OnInit, OnDestroy {
  mode: 'add' | 'edit' | 'view' = 'add';
  id: number | null = null;

  categoryId: number | null = null;

  categories: any[] = [];

  item!: ExpensesItem;

  form!: FormGroup;

  destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private hallsService: HallsService,
    private router: Router,
    private expensesItemsService: ExpensesItemsService,
    public lang: LanguageService,
  ) {}

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];
    this.id = this.route.snapshot.params['id'];
    this.categoryId = this.route.snapshot.queryParams['categoryId'] || null;

    const {categories, item, elements} = this.route.snapshot.data['data'];
    this.categories = categories;
    this.item = item;

    if (this.id) {
      this.initForm({
        ...item,
        elements,
      });
    } else {
      this.initForm({
        category: {id: +this.categoryId! || undefined},
      });
    }
  }

  getControl(name: string) {
    return this.form?.get(name) as FormControl;
  }

  get elements() {
    return this.form.get('elements') as FormArray;
  }
  get accounts() {
    return this.form.get('transferAccounts') as FormArray;
  }

  initForm(data?: ExpensesItem) {
    this.form = this.fb.group(
      {
        hallId: [this.hallsService.getCurrentHall()?.id],
        categoryId: [
          {value: data?.category?.id || null, disabled: true},
          Validators.required,
        ],
        name: [data?.name || null, Validators.required],
        nameAr: [data?.nameAr || null, Validators.required],
        description: [data?.description || null],
        transferAccounts: this.fb.array([]),
        elements: this.fb.array(
          data?.elements?.map((element) => this.createElement(element)) || [],
        ),
      },
      {validators: [requireOneOf(['name', 'nameAr'])]},
    );

    if (this.mode === 'view') {
      this.form.disable();
    }
  }

  createElement(element: any): FormGroup {
    return this.fb.group({
      id: [element.id || null],
      name: [element.name || null, Validators.required],
      nameAr: [element.nameAr || null, Validators.required],
      value: [element.value || null, Validators.required],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();

    const sub =
      this.mode === 'add'
        ? this.expensesItemsService.addExpenseItem(payload)
        : this.expensesItemsService.updateExpenseItem(payload, this.id!);

    sub.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.router.navigate(['purchase-categories/view', this.categoryId]);
    });
  }

  navigateToUpdate() {
    this.router.navigate(['expenses-items/edit', this.id], {
      queryParams: {categoryId: this.categoryId},
    });
  }
  cancel() {
    this.router.navigate(['purchase-categories/view', this.categoryId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

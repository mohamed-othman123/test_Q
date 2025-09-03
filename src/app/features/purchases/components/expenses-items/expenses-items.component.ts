import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {PermissionTypes} from '@auth/models';
import {AuthService, LanguageService} from '@core/services';
import {DrawerService} from '@core/services/drawer.service';
import {noDoubleSpaceValidator, requireOneOf} from '@core/validators';
import {ExpensesElement, ExpensesItem} from '@expenses-items/models';

import {PurchaseCategory} from '@purchase-categories/models/purchase-category.model';
import {ExpensesType} from '@purchases/models/purchase-model';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-expenses-items',
  templateUrl: './expenses-items.component.html',
  styleUrl: './expenses-items.component.scss',
  standalone: false,
})
export class ExpensesItemsComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() purchaseCategoryList!: PurchaseCategory[];
  @Input() expensesItems!: ExpensesItem[];
  @Input() expenseElements!: ExpensesElement[];

  ExpensesType = ExpensesType;

  isEditMode = false;

  destroy$ = new Subject<void>();

  get itemsArray(): FormArray {
    return this.form.get('items') as FormArray;
  }
  constructor(
    public lang: LanguageService,
    private fb: FormBuilder,
    private authService: AuthService,
    private drawerService: DrawerService,
    private route: ActivatedRoute,
  ) {
    this.isEditMode = route.snapshot.data['mode'] === 'edit';
  }

  ngOnInit(): void {
    this.addFirstItemIfNotExist();
    this.handelExpenseTypeChange();
    if (this.isEditMode) {
      this.form.get('expenseItemId')?.disable({emitEvent: false});
    }
  }

  handelExpenseTypeChange() {
    const expenseItemId = this.form.get('expenseItemId');
    this.form
      .get('expensesType')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        if (val === ExpensesType.generalExpenses) {
          expenseItemId?.setValidators(Validators.required);
          this.form
            .get('invoiceType')
            ?.patchValue('simplified', {emitEvent: false});
        } else {
          expenseItemId?.clearValidators();
        }

        this.form.patchValue(
          {category: '', expensesDescription: ''},
          {emitEvent: false},
        );

        expenseItemId?.updateValueAndValidity();
      });
  }

  addFirstItemIfNotExist() {
    if (this.itemsArray.length === 0) {
      this.addNewItem();
    }
  }

  addNewItem(): void {
    this.itemsArray.push(this.createItem());
  }

  createItem(): FormGroup {
    return this.fb.group(
      {
        id: [],
        name: ['', [Validators.required, noDoubleSpaceValidator()]],
        nameAr: ['', [Validators.required, noDoubleSpaceValidator()]],
        value: [null, [Validators.required, Validators.min(1)]],
        quantity: [1, [Validators.required, Validators.min(1)]],
        total: [{value: 0, disabled: true}], // total is calculated so disable editing
        type: ['element'],
        isNew: [null],
        saved: [null],
      },
      {validators: requireOneOf(['name', 'nameAr'])},
    );
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
    this.calculateTotalAmount();
  }

  onPriceChange() {
    this.updateTotals();
    this.calculateTotalAmount();
  }

  onQuantityChange() {
    this.updateTotals();
    this.calculateTotalAmount();
  }

  updateTotals(): void {
    this.itemsArray.controls.forEach((group: any) => {
      const value = group.get('value')?.value || 0;
      const quantity = group.get('quantity')?.value || 0;
      const total = value * quantity;
      group.get('total')?.setValue(total, {emitEvent: false});
    });
  }

  private calculateTotalAmount(): void {
    const total = this.itemsArray.controls.reduce((sum, item) => {
      return sum + (item.get('total')?.value || 0);
    }, 0);
    this.form.get('totalAmount')?.setValue(total, {emitEvent: true});
  }

  onElementSelect(event: ExpensesElement, index: number): void {
    const element = event;
    if (!element) return;

    console.log(element);

    this.itemsArray.controls[index].patchValue({
      id: element.id,
      value: +element.value,
      nameAr: element.nameAr,
      quantity: 1,
      isNew: false,
      saved: false,
    });
    this.itemsArray.controls[index].get('value')?.disable();
    this.updateTotals();
    this.calculateTotalAmount();
  }

  clearElementValues(index: number, isNew: boolean) {
    this.itemsArray.controls[index].patchValue({
      id: null,
      name: '',
      nameAr: '',
      value: null,
      quantity: 1,
      isNew,
      saved: false,
    });
    this.itemsArray.controls[index].get('value')?.enable();
    this.itemsArray.controls[index].get('nameAr')?.enable();
    this.itemsArray.controls[index].get('name')?.enable();
    this.updateTotals();
    this.calculateTotalAmount();
  }

  addNewExpenseElement(index: number) {
    this.itemsArray.controls[index].patchValue({
      id: null,
      name: '',
      nameAr: '',
      value: null,
      isNew: true,
    });
    this.itemsArray.controls[index].get('value')?.enable();
  }

  canAddExpenseElement(): boolean {
    const expenseItemId = this.form.get('expenseItemId')?.value;

    const expensesItem = this.expensesItems.find(
      (item) => item.id === expenseItemId,
    );

    return (
      this.authService.userData?.user.userId === expensesItem?.created_by ||
      this.authService.userData?.user.permissionType === PermissionTypes.GENERAL
    );
  }

  addNewExpenseItem() {
    this.drawerService.open({
      mode: 'add',
      title: 'expensesItems.addNewExpenseItem',
      id: 'expenseItem',
    });
  }

  onCreateExpenseItem(expenseItem: ExpensesItem) {
    if (this.form.get('category')?.value !== expenseItem.category?.id) {
      this.form.get('category')?.patchValue(expenseItem.category?.id);
    } else {
      this.form.get('category')?.reset(0);
      this.form.get('category')?.patchValue(expenseItem.category?.id);
    }

    this.form.get('expenseItemId')?.patchValue(expenseItem.id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

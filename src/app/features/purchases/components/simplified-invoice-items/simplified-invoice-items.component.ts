import {Component, Input} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LanguageService} from '@core/services';
import {noDoubleSpaceValidator, requireOneOf} from '@core/validators';
import {PurchasesService} from '@purchases/services/purchases.service';

@Component({
  selector: 'app-simplified-invoice-items',
  standalone: false,
  templateUrl: './simplified-invoice-items.component.html',
  styleUrl: './simplified-invoice-items.component.scss',
})
export class SimplifiedInvoiceItemsComponent {
  @Input() form!: FormGroup;

  itemsType$ = this.purchasesService.itemTypes;

  get itemsArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  constructor(
    public lang: LanguageService,
    private fb: FormBuilder,
    private purchasesService: PurchasesService,
  ) {}

  createItem(): FormGroup {
    return this.fb.group(
      {
        id: [],
        name: ['', [Validators.required, noDoubleSpaceValidator()]],
        nameAr: ['', [Validators.required, noDoubleSpaceValidator()]],
        value: [null, [Validators.required, Validators.min(1)]],
        quantity: [1, [Validators.required, Validators.min(1)]],
        total: [{value: 0, disabled: true}], // total is calculated so disable editing
        type: ['product', Validators.required],
        isNew: [null],
        saved: [null],
      },
      {validators: requireOneOf(['name', 'nameAr'])},
    );
  }
  addNewItem(): void {
    this.itemsArray.push(this.createItem());
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

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
    this.calculateTotalAmount();
  }

  clearItemValues(index: number, isNew: boolean) {
    this.itemsArray.controls[index].patchValue({
      id: null,
      name: '',
      nameAr: '',
      value: null,
      isNew,
      quantity: 1,
      saved: false,
    });
    this.itemsArray.controls[index].get('value')?.enable();

    this.itemsArray.controls[index].get('nameAr')?.enable();
    this.itemsArray.controls[index].get('name')?.enable();
    this.updateTotals();
    this.calculateTotalAmount();
  }
}

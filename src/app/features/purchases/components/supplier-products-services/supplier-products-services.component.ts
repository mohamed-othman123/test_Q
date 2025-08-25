import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {PermissionTypes} from '@auth/models';
import {AuthService, LanguageService} from '@core/services';
import {DrawerService} from '@core/services/drawer.service';
import {noDoubleSpaceValidator, requireOneOf} from '@core/validators';
import {PurchaseCategory} from '@purchase-categories/models/purchase-category.model';
import {ExpensesType} from '@purchases/models/purchase-model';
import {Service} from '@services/models';
import {Supplier, SupplierProduct} from '@suppliers/models/supplier';

@Component({
  selector: 'app-supplier-products-services',
  templateUrl: './supplier-products-services.component.html',
  styleUrl: './supplier-products-services.component.scss',
  standalone: false,
})
export class SupplierProductsServicesComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() purchaseCategoryList!: PurchaseCategory[];
  @Input() suppliers!: Supplier[];
  @Input() products!: SupplierProduct[];
  @Input() services!: Service[];

  isEditMode = false;

  ExpensesType = ExpensesType;

  supplierItemsType = [
    {
      'value': 'product',
      'label': {
        'ar': 'منتج',
        'en': 'Product',
      },
    },
    {
      'value': 'service',
      'label': {
        'ar': 'خدمة',
        'en': 'Service',
      },
    },
  ];

  get itemsArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  constructor(
    public lang: LanguageService,
    private drawerService: DrawerService,
    private fb: FormBuilder,
    private rote: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.isEditMode = rote.snapshot.data['mode'] === 'edit';
  }

  ngOnInit(): void {}

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

  itemTypeChange(event: any, index: number) {
    this.clearItemValues(index, false);
  }

  onItemSelected(event: any, index: number) {
    const item = event;
    if (!item) return;

    this.itemsArray.controls[index].patchValue({
      id: item.id,
      value: +item.price,
      nameAr: item.name_ar,
      quantity: 1,
      isNew: false,
      saved: false,
    });
    this.itemsArray.controls[index].get('value')?.disable();
    this.updateTotals();
    this.calculateTotalAmount();
  }

  clearItemValues(index: number, isNew: boolean) {
    this.itemsArray.controls[index].patchValue({
      name: '',
      nameAr: '',
      value: null,
      isNew,
      saved: false,
    });
    this.itemsArray.controls[index].get('value')?.enable();
  }

  addNewExpenseItem(index: number) {
    this.itemsArray.controls[index].patchValue({
      id: null,
      name: '',
      nameAr: '',
      value: null,
      isNew: true,
    });
    this.itemsArray.controls[index].get('value')?.enable();
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

  openAddNewSupplierDrawer() {
    this.drawerService.open({
      mode: 'add',
      title: 'suppliers.addNewSupplier',
    });
  }

  canAddProduct(): boolean {
    const supplierId = this.form.get('supplierId')?.value;

    const supplier = this.suppliers.find(
      (supplier) => supplier.id === supplierId,
    );

    return (
      this.authService.userData?.user.userId === supplier?.created_by ||
      this.authService.userData?.user.permissionType === PermissionTypes.GENERAL
    );
  }
}

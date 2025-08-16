import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {LanguageService} from '@core/services';
import {Hall} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {DiscountType} from '@orders/models';
import {PaymentMethod} from '@paymentmethods/models/payment.model';
import {PaymentMethodsService} from '@paymentmethods/services/payment-methods.service';
import {
  ExpensesType,
  InvoiceType,
  PurchaseItem,
  PurchaseModel,
} from '@purchases/models/purchase-model';
import {PurchasesService} from '@purchases/services/purchases.service';
import {Supplier, SupplierProduct} from '@suppliers/models/supplier';
import {SuppliersService} from '@suppliers/services/suppliers.service';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  forkJoin,
  startWith,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import {noDoubleSpaceValidator, requireOneOf} from '@core/validators';
import {PurchaseCategory} from '@purchase-categories/models/purchase-category.model';
import {ExpensesElement, ExpensesItem} from '@expenses-items/models';
import {ExpensesItemsService} from '@expenses-items/services/expenses-items.service';
import {Service} from '@services/models';
import {discountValidator} from '@core/validators/discount-validators';
import {duplicateItemValidator} from '@purchases/validators/duplicate-item.validator';

@Component({
  selector: 'app-purchase-details',
  templateUrl: './purchase-details.component.html',
  styleUrl: './purchase-details.component.scss',
  standalone: false,
})
export class PurchaseDetailsComponent implements OnInit, OnDestroy {
  @Input() purchase: PurchaseModel | null = null;

  isPatchingForm = false;

  isViewMode = false;

  isEditMode = false;

  showAddPaymentForm = false;

  form!: FormGroup;

  purchaseCategoryList: PurchaseCategory[] = [];
  expensesItems!: ExpensesItem[];
  expenseElements!: ExpensesElement[];
  suppliers: Supplier[] = [];
  products: SupplierProduct[] = [];
  services: Service[] = [];

  selectedHall: Hall | null = null;

  subs = new Subscription();

  paymentMethods: PaymentMethod[] = [];

  private destroyed$ = new Subject<void>();

  ExpensesType = ExpensesType;

  selectedSupplier: Supplier | null = null;
  selectedExpenseItem: ExpensesItem | null = null;

  get itemsArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  constructor(
    public purchasesService: PurchasesService,
    public router: Router,
    public lang: LanguageService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private hallsService: HallsService,
    private suppliersService: SuppliersService,
    private paymentMethodsService: PaymentMethodsService,
    private expensesItemsService: ExpensesItemsService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const mode = this.route.snapshot.data['mode'];
    this.isEditMode = mode === 'edit';
    this.isViewMode = mode === 'view';

    this.getCurrentHall();

    this.initForm();

    this.loadExpenses();

    this.setDiscountValidator();

    this.handelChangesInExpense();

    this.getCurrentHallPaymentMethods();

    this.handleFormValueChanges();
    this.handleCalculationTriggers();
  }

  loadExpenses() {
    this.purchasesService.currentPurchase$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        if (!data) return;
        this.patchForm(data!);
      });
  }

  handelChangesInExpense() {
    // stream of expenseType changes (with initial emission)
    const expenseType$ = this.form.get('expensesType')?.valueChanges.pipe(
      startWith(this.form.get('expensesType')?.value),
      distinctUntilChanged(),
      tap((type) => {
        if (this.isPatchingForm) return;

        this.form.patchValue(
          {category: null, expensesDescription: null},
          {emitEvent: false},
        );
      }),
      takeUntil(this.destroyed$),
    );

    // load categories on any type change
    expenseType$!
      .pipe(
        switchMap((type) => {
          return this.purchasesService.getPurchaseCategoriesList({
            type,
            hallId: this.selectedHall?.id,
          });
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe((cats) => (this.purchaseCategoryList = cats.items));

    // category -> items only for General
    this.form
      .get('category')
      ?.valueChanges.pipe(
        startWith(this.form.get('category')?.value),
        distinctUntilChanged(),
        tap((catId) => {
          if (this.isPatchingForm) return;

          this.handleCategoryChanged(catId);

          this.itemsArray.clear();
          this.itemsArray.push(this.createItem('element'));
          this.form.patchValue({expenseItemId: null}, {emitEvent: false});
          this.expensesItems = this.expenseElements = [];
        }),
        withLatestFrom(expenseType$!),
        filter(([_, type]) => type === 'General'),
        switchMap(([categoryId]) =>
          this.expensesItemsService.getExpenseItems({
            categoryId,
            hallId: this.selectedHall?.id,
          }),
        ),
        takeUntil(this.destroyed$),
      )
      .subscribe((items) => (this.expensesItems = items.items));

    // item -> elements only for General
    this.form
      .get('expenseItemId')
      ?.valueChanges.pipe(
        tap(() => {
          if (this.isPatchingForm) return;

          this.itemsArray.clear();
          this.itemsArray.push(this.createItem('element'));
          this.expenseElements = [];
        }),
        withLatestFrom(expenseType$!),
        filter(([itemId, type]) => {
          return type === 'General' && itemId;
        }),
        switchMap(([itemId]) =>
          forkJoin({
            expenseElements: this.expensesItemsService.getExpenseElements({
              hallId: this.selectedHall?.id,
              itemId,
            }),
            expenseItemDetails:
              this.expensesItemsService.getExpenseItemById(itemId),
          }),
        ),
        takeUntil(this.destroyed$),
      )
      .subscribe(({expenseElements, expenseItemDetails}) => {
        this.expenseElements = expenseElements.items;
        this.selectedExpenseItem = expenseItemDetails;
      });

    //invoiceType -> suppliers only for Purchases & tax
    this.form
      .get('invoiceType')
      ?.valueChanges.pipe(
        distinctUntilChanged(),
        withLatestFrom(expenseType$!),
        tap(([invoiceType, _]) => {
          const invoiceId = this.form.get('invoiceReference');
          const supplierId = this.form.get('supplierId');

          if (invoiceType === 'simplified') {
            invoiceId?.clearValidators();
            supplierId?.clearValidators();
          } else {
            invoiceId?.setValidators(Validators.required);
            supplierId?.setValidators(Validators.required);
          }
          invoiceId?.updateValueAndValidity({emitEvent: false});
          supplierId?.updateValueAndValidity({emitEvent: false});

          this.form.patchValue(
            {category: null, expensesDescription: null},
            {emitEvent: false},
          );

          if (!this.isEditMode) this.itemsArray.clear();
        }),
        filter(([inv, type]) => {
          return (
            type === 'Purchases' && inv === 'tax' && this.suppliers.length === 0
          );
        }),
        tap(() => {
          this.suppliers = this.products = this.services = [];
        }),
        switchMap(() =>
          this.suppliersService.getSuppliers({
            hallId: this.selectedHall?.id,
            active: true,
          }),
        ),
        takeUntil(this.destroyed$),
      )
      .subscribe((sups) => {
        this.suppliers = sups.items;
      });

    // supplier -> products & services only for Purchases & tax
    this.form
      .get('supplierId')
      ?.valueChanges.pipe(
        startWith(this.form.get('supplierId')?.value),
        withLatestFrom(
          expenseType$!,
          this.form
            .get('invoiceType')
            ?.valueChanges!?.pipe(
              startWith(this.form.get('invoiceType')?.value),
            ),
        ),
        filter(([_, type, invoice]) => {
          return type === 'Purchases' && invoice === 'tax';
        }),
        tap(() => {
          if (this.isPatchingForm) return;

          this.itemsArray.clear();
          this.itemsArray.push(this.createItem('product'));
          this.products = this.services = [];
        }),
        switchMap(([supId]) =>
          forkJoin({
            products: this.suppliersService.getSupplierItems(
              'product',
              supId,
              this.selectedHall?.id!,
            ),
            services: this.suppliersService.getSupplierItems(
              'service',
              supId,
              this.selectedHall?.id!,
            ),
            supplier: this.suppliersService.getSupplierById(supId),
          }),
        ),
        takeUntil(this.destroyed$),
      )
      .subscribe(({products, services, supplier}) => {
        this.products = products.items as any;
        this.services = services.items as any;
        this.selectedSupplier = supplier;
      });
  }

  private handleCategoryChanged(id: number) {
    if (id) {
      const category = this.purchaseCategoryList.find((c) => c.id === id);
      const description =
        this.lang.lang === 'ar' ? category?.description : category?.description;
      this.form.get('expensesDescription')?.patchValue(description);
    }
  }

  private getCurrentHallPaymentMethods() {
    this.hallsService.currentHall$
      .pipe(
        switchMap((hall) => {
          return this.paymentMethodsService.getListPaymentMethods({
            hallId: hall?.id,
          });
        }),
      )
      .subscribe((data) => {
        this.paymentMethods = data.items;
      });
  }

  private patchForm(purchase: PurchaseModel): void {
    if (!purchase) return;
    this.isPatchingForm = true;

    this.showAddPaymentForm = purchase.showPayment || false;
    this.selectedExpenseItem = purchase.selectedExpenseItem || null;
    this.selectedSupplier = purchase.selectedSupplier || null;

    this.itemsArray.clear();
    purchase.items.forEach((item) => {
      const priceNumber =
        typeof item.value === 'string' ? parseFloat(item.value) : item.value;

      this.addItem({
        id: item.id,
        name: item.name,
        nameAr: item.nameAr || (item.name as any),
        value: priceNumber,
        quantity: item.quantity,
        total: item.quantity * priceNumber,
        type: item.type,
        isNew: item.isNew,
      });
    });

    const formDiscountType =
      purchase.discountType === DiscountType.FIXED ? 'amount' : 'percentage';

    const formInvoiceType =
      purchase.invoiceType === 'Tax Invoice' ? 'tax' : 'simplified';

    const purchaseDateObj = purchase.purchaseDate
      ? new Date(purchase.purchaseDate)
      : null;
    const payingDateObj = purchase.dueDate ? new Date(purchase.dueDate) : null;
    const supplyDateObj = purchase.deliveryDate
      ? new Date(purchase.deliveryDate)
      : null;

    this.form.patchValue({
      invoiceType: formInvoiceType,
      expensesType: purchase.category?.type || purchase.expensesType,
      supplierId: purchase.supplier ? purchase.supplier.id : null,
    });

    setTimeout(() => {
      this.form.patchValue({
        invoiceReference: purchase.invoiceReference,
        purchaseDate: this.toDateStruct(purchaseDateObj),
        payingDate: this.toDateStruct(payingDateObj),
        supplyDate: this.toDateStruct(supplyDateObj),
        paidAmount: purchase.paidAmount,
        notes: purchase.notes,
        invoiceType: formInvoiceType,
        totalAmount: Number(purchase.subtotal) || 0,
        discountValue: Number(purchase.discountValue) || 0,
        discountType: formDiscountType,
        vat: Number(purchase.vat),
        finalAmount: Number(purchase.totalPayable),
        category: purchase.category?.id,
        expensesDescription: purchase.expensesDescription || '',
        expenseItemId: purchase.expenseItem?.id || purchase.expenseItemId,
        payment: {
          amount: purchase.payment?.amount || purchase.paidAmount || null,
          hallPaymentMethodId: purchase.payment?.hallPaymentMethodId || null,
          notes: purchase.payment?.notes || null,
          supplierPaymentMethodId:
            purchase.payment?.supplierPaymentMethodId || null,
          itemTransferAccountId:
            purchase.payment?.itemTransferAccountId || null,
          cashReceiverName: purchase.payment?.cashReceiverName || null,
          posName: purchase.payment?.posName || null,
        },
        remainingAmount:
          Number(purchase.totalPayable) - Number(purchase?.paidAmount),
      });

      if (this.isViewMode) {
        this.form.disable();
      }
      this.isPatchingForm = false;
      this.cd.detectChanges();
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      expensesType: [ExpensesType.purchasesExpenses, Validators.required],
      invoiceType: ['simplified', Validators.required],
      invoiceReference: [''],
      supplierId: [null as number | null],
      purchaseDate: [null, Validators.required],
      payingDate: [null, Validators.required],
      supplyDate: [null],
      paidAmount: [0],
      paymentMethod: [''],
      notes: [''],
      items: this.fb.array([], duplicateItemValidator()),
      totalAmount: [null, [Validators.required, Validators.min(0)]],
      discountType: ['percentage', Validators.required],
      discountValue: [null, [Validators.min(0)]],
      vat: [15, [Validators.required, Validators.min(0)]],
      amountAfterDiscount: [{value: 0, disabled: true}],
      finalAmount: [{value: 0, disabled: true}],
      remainingAmount: [0],
      category: [null, Validators.required],
      expenseItemId: [null],
      expensesDescription: [null],
      payment: this.fb.group({
        amount: [null, [Validators.min(0)]],
        paymentType: ['Income'],
        hallPaymentMethodId: [null],
        supplierPaymentMethodId: [null],
        itemTransferAccountId: [null],
        cashReceiverName: [null],
        posName: [null],
        notes: [''],
      }),
    });
  }

  private getCurrentHall(): void {
    this.selectedHall = this.hallsService.getCurrentHall();
  }

  private handleFormValueChanges(): void {
    this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.calculatePaymentDetails();
    });
  }

  calculatePaymentDetails(): void {
    const totalAmount = this.form.get('totalAmount')?.value || 0;
    const discountType = this.form.get('discountType')?.value;
    const discountValue = this.form.get('discountValue')?.value || 0;
    const paidAmount = this.form.get('payment.amount')?.value;
    const expenseType = this.form.get('expensesType')?.value;

    const vatRate = expenseType === ExpensesType.generalExpenses ? 0 : 15;

    const discountAmount = this.calculateDiscountAmount(
      totalAmount,
      discountType,
      discountValue,
    );
    const amountAfterDiscount = totalAmount - discountAmount;
    const vatAmount = Number(
      ((amountAfterDiscount * vatRate) / 100).toFixed(2),
    );
    const finalAmount = Number((amountAfterDiscount + vatAmount).toFixed(2));

    const remainingAmount = Number(
      (amountAfterDiscount + vatAmount - paidAmount).toFixed(2),
    );

    this.form.patchValue(
      {
        amountAfterDiscount,
        vat: vatAmount,
        finalAmount,
        remainingAmount,
      },
      {emitEvent: false},
    );
  }

  private calculateDiscountAmount(
    total: number,
    type: string,
    value: number,
  ): number {
    if (type === 'percentage') {
      return (total * value) / 100;
    } else if (type === 'amount') {
      return value;
    }
    return 0;
  }

  private handleCalculationTriggers(): void {
    combineLatest([
      this.form
        .get('totalAmount')!
        .valueChanges.pipe(startWith(this.form.get('totalAmount')?.value || 0)),
      this.form
        .get('discountType')!
        .valueChanges.pipe(startWith(this.form.get('discountType')?.value)),
      this.form
        .get('discountValue')!
        .valueChanges.pipe(
          startWith(this.form.get('discountValue')?.value || 0),
        ),
      this.form
        .get('vat')!
        .valueChanges.pipe(startWith(this.form.get('vat')?.value || 15)),
      this.form
        .get('payment.amount')!
        .valueChanges.pipe(
          startWith(this.form.get('payment.amount')?.value || 0),
        ),
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.calculatePaymentDetails();
      });
  }

  addItem(item?: Partial<PurchaseItem>): void {
    const itemGroup = this.createItemFormGroup(item);
    this.itemsArray.push(itemGroup);
  }

  createItem(type: 'product' | 'service' | 'element'): FormGroup {
    return this.fb.group(
      {
        id: [],
        name: ['', [Validators.required, noDoubleSpaceValidator()]],
        nameAr: ['', [Validators.required, noDoubleSpaceValidator()]],
        value: [null, [Validators.required, Validators.min(1)]],
        quantity: [1, [Validators.required, Validators.min(1)]],
        total: [{value: 0, disabled: true}], // total is calculated so disable editing
        type: [type],
        isNew: [null],
      },
      {validators: requireOneOf(['name', 'nameAr'])},
    );
  }

  private createItemFormGroup(item?: Partial<PurchaseItem>): FormGroup {
    const itemGroup = this.fb.group(
      {
        id: [item?.id || null],
        name: [item?.name?.['name'] || item?.name, Validators.required],
        nameAr: [
          typeof item?.nameAr === 'object'
            ? item?.nameAr['nameAr']
            : item?.nameAr,
          Validators.required,
        ],
        value: [
          Number(item?.value) || 0,
          [Validators.required, Validators.min(0)],
        ],
        quantity: [
          Number(item?.quantity) || 1,
          [Validators.required, Validators.min(1)],
        ],
        total: [item?.total || 0],
        type: [item?.type],
        isNew: [item?.isNew || false],
        saved: [true],
      },
      {validators: requireOneOf(['name', 'nameAr'])},
    );

    return itemGroup;
  }

  private toDateStruct(d: Date | null): NgbDateStruct | null {
    if (!d) return null;
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    };
  }

  openAddPaymentForm() {
    this.showAddPaymentForm = true;
    this.form
      .get('payment.amount')
      ?.addValidators([Validators.required, Validators.min(0)]);
    this.form.get('payment.amount')?.updateValueAndValidity();
    this.form
      .get('payment.hallPaymentMethodId')
      ?.addValidators([Validators.required]);
    this.form.get('payment.hallPaymentMethodId')?.updateValueAndValidity();
  }

  cancelAddPayment() {
    this.showAddPaymentForm = false;
    this.form.get('payment.amount')?.clearValidators();
    this.form.get('payment.amount')?.updateValueAndValidity();

    this.form.get('payment.hallPaymentMethodId')?.clearValidators();
    this.form.get('payment.hallPaymentMethodId')?.updateValueAndValidity();
  }

  onDiscountChange(): void {
    this.calculatePaymentDetails();
  }

  cancel() {
    this.router.navigate(['/purchases']);
  }

  nextStep() {
    console.log(this.form);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.purchasesService.currentStep$.next(1);
  }

  prepareFormData(): PurchaseModel {
    const values = this.form.getRawValue();

    const mappedInvoiceType =
      values.invoiceType === 'tax' ? InvoiceType.TAX : InvoiceType.SIMPLIFIED;
    const mappedDiscountType =
      values.discountType === 'percentage'
        ? DiscountType.PERCENT
        : DiscountType.FIXED;

    const purchaseDate = this.formatDate(values.purchaseDate);
    const dueDate = this.formatDate(values.payingDate);

    return {
      expensesType: values.expensesType,
      invoiceType: mappedInvoiceType,
      subtotal: (values.totalAmount || 0).toString(),
      subtotalAfterDisc: (values.amountAfterDiscount || 0).toString(),
      discountType: mappedDiscountType,
      vat: (values.vat || 0).toString(),
      totalPayable: (values.finalAmount || 0).toString(),
      purchaseDate: purchaseDate as string,
      dueDate: dueDate as string,
      deliveryDate: this.formatDate(values.supplyDate) as string,
      supplier: {id: values.supplierId},
      invoiceReference: values.invoiceReference?.trim(),
      items: this.itemsArray.getRawValue(),
      discountValue: values.discountValue?.toString(),
      notes: values.notes?.trim(),
      category: {id: values.category},
      expensesDescription: values.expensesDescription,
      payment: this.showAddPaymentForm ? values.payment : null,
      expenseItemId: values.expenseItemId,
      showPayment: this.showAddPaymentForm,
      selectedExpenseItem: this.selectedExpenseItem,
      selectedSupplier: this.selectedSupplier,
    };
  }

  private formatDate(date: any) {
    if (!date) return null;

    if (typeof date === 'string') {
      return new Date(date).toISOString();
    }

    if (date instanceof Date) {
      return date.toISOString();
    }

    if (date && typeof date === 'object') {
      if (date.year && date.month && date.day) {
        const timeZoneDate = new Date(date.year, date.month - 1, date.day);
        timeZoneDate.setMinutes(
          timeZoneDate.getMinutes() - timeZoneDate.getTimezoneOffset(),
        );
        return timeZoneDate.toISOString();
      }
    }
    return null;
  }

  cancelAddDiscount() {
    this.form.get('discountValue')?.setValue(0);
    this.calculatePaymentDetails();
  }

  onCreateSupplier(supplier: Supplier) {
    this.suppliersService
      .getSuppliers({hallId: this.selectedHall?.id})
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (response) => {
          this.suppliers = response.items;
          this.form.get('supplierId')?.setValue(supplier.id);
        },
      });
  }

  setDiscountValidator() {
    this.form.setValidators(
      discountValidator('discountType', 'discountValue', 'totalAmount'),
    );
    this.form.updateValueAndValidity({emitEvent: false});
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.subs.unsubscribe();

    const value = {
      ...this.purchasesService.currentPurchase$.value,
      ...(this.prepareFormData() as any),
    };

    this.purchasesService.currentPurchase$.next(value);
  }
}

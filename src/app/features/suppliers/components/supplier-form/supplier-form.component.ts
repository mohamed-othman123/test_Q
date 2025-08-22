import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {SuppliersService} from '../../services/suppliers.service';
import {forkJoin, Subscription, tap} from 'rxjs';
import {
  Supplier,
  SupplierPaymentMethod,
  SupplierProduct,
  supplierService,
} from '@suppliers/models/supplier';
import {HallsService} from '@halls/services/halls.service';
import {Hall} from '@halls/models/halls.model';
import {ActivatedRoute, Router} from '@angular/router';
import {ParsedPhoneNumber} from '@core/models/ParsedPhoneNumber';
import {requireOneOf, validateDoubleName} from '@core/validators';
import {
  LanguageService,
  NotificationService,
  FilterService,
} from '@core/services';
import {SUPPLIER_STATUS_OPTIONS} from '@suppliers/constants/constants';
import {Item, DataTableFilter} from '@core/models';
import {CommentType} from '@shared/components/comments/models/comment';
import {PurchaseModel} from '@purchases/models/purchase-model';
import {Filter} from '@core/interfaces';
import {Table} from 'primeng/table';
import {HttpClient} from '@angular/common/http';
import {stringifyDate} from '@shared/components/date-picker/helper/date-helper';
import {ExpensesType} from '@purchases/constants/purchase.constants';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import moment from 'moment';

@Component({
  selector: 'app-supplier-form',
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.scss',
  standalone: false,
})
export class SupplierFormComponent extends Filter implements OnInit, OnDestroy {
  @ViewChild('expensesTable') expensesTable!: Table;

  form!: FormGroup;
  override subs = new Subscription();
  currentHall: Hall | null = null;
  supplierId: string | null = null;
  isEditMode = false;
  isViewMode = false;
  supplier: Supplier | null = null;
  supplierServices: supplierService[] = [];
  commentType = CommentType;
  selectedProducts: SupplierProduct[] = [];
  editingProductIndex: number | null = null;
  isEditingProduct = false;
  originalProduct: SupplierProduct | null = null;

  supplierExpenses: PurchaseModel[] = [];
  expensesLoading = false;
  expensesTotalRecords = 0;
  expensesRows = 10;
  expensesFirst = 0;
  expensesRowsPerPageOptions = [5, 10, 25];

  expenseTypes: Item[] = ExpensesType;
  purchaseStatuses: Item[] = [];

  private destroy$ = new Subject<void>();

  protected override filterConfig: {[key: string]: unknown} = {
    type: [null],
    purchaseDate: [null],
    dueDate: [null],
    totalAmount: [null],
    status: [null],
    invoiceReference: [null],
  };

  productsForm = new FormGroup(
    {
      id: new FormControl<string | null>(null),
      name: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      name_ar: new FormControl(null, {validators: [Validators.required]}),
      price: new FormControl<number | null>(null, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
    },
    [requireOneOf(['name', 'name_ar'])],
  );

  statusOptions: Item[] = SUPPLIER_STATUS_OPTIONS;

  get paymentMethods() {
    return this.form.get('paymentMethods') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private suppliersService: SuppliersService,
    private hallsService: HallsService,
    private router: Router,
    private route: ActivatedRoute,
    public lang: LanguageService,
    private notificationService: NotificationService,
    protected override filterService: FilterService,
    private http: HttpClient,
  ) {
    super(filterService);
    this.initForm();
    this.currentHall = this.hallsService.getCurrentHall();
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.isViewMode = this.route.snapshot.data['mode'] === 'view';
    if (this.isViewMode) {
      this.form.disable();
    }

    this.loadPurchaseStatuses();

    this.subs.add(
      this.route.params.subscribe((params) => {
        if (params['id']) {
          this.supplierId = params['id'];
          this.isEditMode = !this.isViewMode;
          this.loadSupplierData();
        }
      }),
    );
  }

  private loadPurchaseStatuses(): void {
    const sub = this.http
      .get<{purchaseStatuses: Item[]}>('assets/lovs/purchase-items.json')
      .subscribe({
        next: (data) => {
          this.purchaseStatuses = data.purchaseStatuses;
        },
        error: (error) => {
          console.error('Error loading purchase statuses:', error);
        },
      });

    this.subs.add(sub);
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    if (!this.supplierId || !this.currentHall || !this.isViewMode) {
      return;
    }

    this.loadSupplierExpenses(filters);
  }

  private loadSupplierExpenses(filters: DataTableFilter = {}): void {
    if (!this.supplierId || !this.currentHall) {
      return;
    }

    this.expensesLoading = true;

    const {dueDate, purchaseDate, ...formattedFilters} = {...filters};
    if (purchaseDate) {
      const date = stringifyDate(purchaseDate);
      if (!moment(date).isValid()) return;

      formattedFilters['purchaseDate'] = date;
    }

    if (dueDate) {
      const date = stringifyDate(dueDate);
      if (!moment(date).isValid()) return;

      formattedFilters['dueDate'] = date;
    }

    formattedFilters['page'] =
      Math.floor(this.expensesFirst / this.expensesRows) + 1;
    formattedFilters['limit'] = this.expensesRows;

    const sub = this.suppliersService
      .getSupplierExpenses(
        this.supplierId,
        this.currentHall.id,
        formattedFilters,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.supplierExpenses = response.items;
          this.expensesTotalRecords = response.totalItems;
          this.expensesLoading = false;
        },
        error: (error) => {
          console.error('Error loading supplier expenses:', error);
          this.expensesLoading = false;
        },
      });

    this.subs.add(sub);
  }

  onExpensesLazyLoad(event: any): void {
    this.expensesFirst = event.first;
    this.expensesRows = event.rows;

    const currentFilters = this.getFiltersFromForm();

    if (event.sortField) {
      currentFilters['sortBy'] = event.sortField;
      currentFilters['sortOrder'] = event.sortOrder === 1 ? 'ASC' : 'DESC';
    }

    this.loadSupplierExpenses(currentFilters);
  }

  private getFiltersFromForm(): DataTableFilter {
    const formValue = this.filterForm.value;
    const filters: DataTableFilter = {};

    Object.keys(formValue).forEach((key) => {
      if (
        formValue[key] !== null &&
        formValue[key] !== undefined &&
        formValue[key] !== ''
      ) {
        filters[key] = formValue[key];
      }
    });

    return filters;
  }

  viewExpense(expense: PurchaseModel): void {
    this.router.navigate(['/purchases/view', expense.id]);
  }

  deleteProduct(index: number) {
    const product = this.selectedProducts[index];

    if (this.supplierId) {
      this.suppliersService
        .deleteSupplierProduct(this.supplierId, product.id!)
        .subscribe();
    }
    this.selectedProducts.splice(index, 1);
  }

  private loadSupplierData() {
    if (this.supplierId) {
      const sub = forkJoin({
        supplier: this.suppliersService.getSupplierById(this.supplierId),
        products: this.suppliersService.getSupplierItems(
          'product',
          this.supplierId,
          this.currentHall?.id!,
        ),
        services: this.suppliersService.getSupplierItems(
          'service',
          this.supplierId,
          this.currentHall?.id!,
        ),
      }).subscribe(({supplier, products, services}) => {
        this.supplier = supplier;
        this.selectedProducts = products.items as any;
        this.supplierServices = services.items as any;

        this.form.patchValue({
          active: !supplier.active,
        });

        this.form.patchValue({
          name: supplier.name,
          phone: supplier.phone,
          commercialRegistrationNumber: supplier.commercialRegistrationNumber,
          taxRegistrationNumber: supplier.taxRegistrationNumber,
          email: supplier.email,
          address: supplier.address,
          activity: supplier.activity,
          active: supplier.active,
          note: supplier.note,
          products: this.selectedProducts,
        });

        if (this.isViewMode) {
          this.loadSupplierExpenses();
        }
      });
    }
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, validateDoubleName()]],
      phone: [null as string | null, [Validators.required]],
      commercialRegistrationNumber: [
        '',
        [
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern(/^[1-9]\d{9}$/),
        ],
      ],
      taxRegistrationNumber: [
        '',
        [
          Validators.minLength(15),
          Validators.maxLength(15),
          Validators.pattern(/^[1-9]\d{14}$/),
        ],
      ],
      email: ['', [Validators.email]],
      address: [''],
      activity: [''],
      active: [true],
      note: [''],
      paymentMethods: this.fb.array([]),
      products: [[] as SupplierProduct[]],
    });
  }

  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  getProductControl(name: string): FormControl {
    return this.productsForm.get(name) as FormControl;
  }

  cancel() {
    this.router.navigate(['/suppliers']);
  }

  editSupplier() {
    if (this.supplierId) {
      this.router.navigate(['/suppliers/edit', this.supplierId]);
    }
  }

  editProduct(rowIndex: number) {
    this.editingProductIndex = rowIndex;
    this.isEditingProduct = true;
    const product = this.selectedProducts[rowIndex];
    this.originalProduct = {...product};
    this.productsForm.patchValue(product as any);
  }

  cancelEdit() {
    this.editingProductIndex = null;
    this.isEditingProduct = false;
    this.originalProduct = null;
    this.productsForm.reset();
  }

  addProduct() {
    if (this.productsForm.invalid) {
      this.productsForm.markAllAsTouched();
      return;
    }

    const product = this.productsForm.value as SupplierProduct;

    if (this.supplierId) {
      const sub =
        this.editingProductIndex !== null
          ? this.suppliersService.updateSupplierProduct(
              this.supplierId,
              product,
            )
          : this.suppliersService.addSupplierProduct(this.supplierId!, product);

      sub.subscribe((res) => {
        this.handelProductAddOrUpdate(res);
      });
    } else {
      this.handelProductAddOrUpdate(product);
    }
  }

  handelProductAddOrUpdate(product: SupplierProduct) {
    if (this.editingProductIndex !== null) {
      this.selectedProducts[this.editingProductIndex] = product;
    } else {
      this.selectedProducts = [product, ...this.selectedProducts];
    }

    this.form.patchValue({products: this.selectedProducts});
    this.cancelEdit();
  }

  submit() {
    if (this.isEditingProduct) {
      this.notificationService.showError('suppliers.updateTheProductFirst');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      window.scrollTo({top: 0, behavior: 'smooth'});
      return;
    }

    const paymentMethods = this.form
      .get('paymentMethods')
      ?.getRawValue()
      .map((method: SupplierPaymentMethod) => {
        return {
          ...method,
          eWalletPhone: method.eWalletPhone
            ? (method.eWalletPhone as any).internationalNumber
            : null,
        };
      });
    const formValue = {
      ...this.form.value,
      paymentMethods,
      halls: [{id: this.currentHall?.id}],
    };

    if (this.formControls['phone'].dirty && formValue.phone) {
      formValue.phone = (
        formValue.phone as unknown as ParsedPhoneNumber
      ).internationalNumber;
    }

    let sub;
    if (this.isEditMode && this.supplierId) {
      sub = this.suppliersService
        .updateSupplier(this.supplierId, formValue)
        .subscribe(() => {
          this.router.navigate(['/suppliers']);
        });
    } else {
      sub = this.suppliersService.createSupplier(formValue).subscribe(() => {
        this.router.navigate(['/suppliers']);
      });
    }

    this.subs.add(sub);
  }

  get formControls() {
    return this.form.controls;
  }

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subs.unsubscribe();
  }
}

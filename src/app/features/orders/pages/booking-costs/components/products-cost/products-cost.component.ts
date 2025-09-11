import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {FormBuilder, FormGroup, NgModel, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Filter} from '@core/interfaces';
import {DataTableFilter} from '@core/models';
import {FilterService, LanguageService} from '@core/services';
import {HallsService} from '@halls/services/halls.service';
import {InventoryItem} from '@inventory/models/inventory';
import {InventoryService} from '@inventory/services/inventory.service';
import {bookingItem} from '@orders/models';
import {BookingCostService} from '@orders/services/booking-cost.service';
import {remainingQuantityValidator} from '@orders/validators/remaining-quantity.validator';
import {Table} from 'primeng/table';

@Component({
  selector: 'app-products-cost',
  standalone: false,
  templateUrl: './products-cost.component.html',
  styleUrl: './products-cost.component.scss',
})
export class ProductsCostComponent extends Filter implements OnInit {
  @Input() lockCosts: boolean = false;
  @Output() productsCost = new EventEmitter<number>();

  @ViewChild('quantityInput') quantityInput!: NgModel;

  @ViewChild('dt2')
  override dataTable!: Table;

  protected override filterConfig: {[key: string]: unknown} = {
    type: ['inventory'],
  };

  bookingId: number;

  products: bookingItem[] = [];

  totalProductCost: number = 0;

  form!: FormGroup;

  productsList: InventoryItem[] = [];

  showAddProductForm: boolean = false;

  isEditing: boolean = false;

  originalEditedProductData: bookingItem = {};

  constructor(
    public lang: LanguageService,
    private bookingCostService: BookingCostService,
    protected override filterService: FilterService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private hallsService: HallsService,
  ) {
    super(filterService);
    this.bookingId = Number(this.route.snapshot.paramMap.get('id'));
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.getAllInventoryItems();
    this.initForm();
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    this.bookingCostService
      .getBookingItems(filters, this.bookingId)
      .subscribe((res) => {
        this.totalRecords = res.totalItems;
        this.products = res.items;
        this.calculateTotalProductsCost(this.products);
      });
  }

  initForm() {
    this.form = this.fb.group(
      {
        product: [null, Validators.required],
        type: ['inventory'],
        quantity: [null, [Validators.required, Validators.min(1)]],
        note: [null],
      },
      {validators: [remainingQuantityValidator()]},
    );
  }

  getAllInventoryItems() {
    const hallId = this.hallsService.getCurrentHall()?.id;
    this.inventoryService
      .getInventoryItems({hallId, nonZeroQuantity: true})
      .subscribe((res) => {
        this.productsList = res.items;
      });
  }

  closeAddProductForm() {
    this.showAddProductForm = false;
    this.form.reset();
  }

  preparePayload() {
    const values = this.form.value;
    return {
      id: values.product.id,
      type: values.type || 'inventory',
      quantity: +values.quantity,
      note: values.note,
    };
  }

  addProduct() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.preparePayload();

    this.bookingCostService
      .addProduct(payload, this.bookingId)
      .subscribe(() => {
        this.loadDataTable(this.filters);
        this.form.reset();
        this.showAddProductForm = false;
        this.isEditing = false;
      });
  }

  editProduct(product: bookingItem) {
    if (this.isEditing) return;

    this.originalEditedProductData = JSON.parse(JSON.stringify(product));
    product['editing'] = true;
    this.isEditing = true;
  }

  cancelEdit(product: bookingItem) {
    Object.assign(product, this.originalEditedProductData);

    this.isEditing = false;
    product.editing = false;
  }

  deleteProduct(product: bookingItem) {
    this.bookingCostService
      .deleteProduct(this.bookingId, product.id!)
      .subscribe(() => {
        this.loadDataTable(this.filters);
      });
  }

  updateProduct(product: bookingItem) {
    if (this.quantityInput.invalid) {
      this.quantityInput.control.markAsTouched();
      return;
    }

    this.bookingCostService
      .updateProduct(product, this.bookingId, product.id!)
      .subscribe(() => {
        this.loadDataTable(this.filters);
        this.isEditing = false;
      });
  }
  calculateTotalProductsCost(products: bookingItem[] = []) {
    this.totalProductCost = products.reduce((acc, item) => {
      return acc + (item.price! * item.quantity! || 0);
    }, 0);

    this.productsCost.emit(this.totalProductCost);
  }

  calculateAvailableQuantity(product: bookingItem) {
    const originalQuantity = this.originalEditedProductData.quantity || 0;

    const currentQuantity = product.quantity || 0;

    if (currentQuantity < 0) return;

    const addOrSubtractQuantity = currentQuantity - originalQuantity;

    if (product.inventory && this.originalEditedProductData.inventory) {
      product.inventory.quantity =
        this.originalEditedProductData.inventory?.quantity -
        addOrSubtractQuantity;

      if (product.inventory.quantity < 0) {
        product.inventory.quantity = 0;
      }
    }
  }
}

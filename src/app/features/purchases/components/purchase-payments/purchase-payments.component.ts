import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SuppliersService} from '@suppliers/services/suppliers.service';
import {Filter} from '@core/interfaces';
import {FilterService, LanguageService} from '@core/services';
import {DataTableFilter} from '@core/models';
import {combineLatest, of, Subject, switchMap} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {PurchasePaymentsService} from '@purchases/services/purchase-payment.service';
import {PurchaseModel} from '@purchases/models/purchase-model';
import {Supplier} from '@suppliers/models/supplier';
import {PurchasesService} from '@purchases/services/purchases.service';
import {PaymentMethodsService} from '@paymentmethods/services/payment-methods.service';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';
import {ExpensesItem} from '@expenses-items/models';
import {PaymentMethod} from '@paymentmethods/models/payment.model';
import {ExpensesItemsService} from '@expenses-items/services/expenses-items.service';

@Component({
  selector: 'app-purchase-payments',
  templateUrl: './purchase-payments.component.html',
  styleUrls: ['./purchase-payments.component.scss'],
  standalone: false,
})
export class PurchasePaymentsComponent
  extends Filter
  implements OnInit, OnDestroy
{
  payments: any[] = [];
  purchaseId!: number;
  purchase: PurchaseModel | null = null;
  supplier: Supplier | null = null;
  expenseItem: ExpensesItem | null = null;
  paymentMethods: PaymentMethod[] = [];

  paymentForm!: FormGroup;
  isShowingForm = false;
  isEditMode: boolean = false;
  selectedPaymentId: number | null = null;

  private destroyed$ = new Subject<void>();

  protected override filterConfig: {[key: string]: unknown} = {
    purchaseId: [null],
  };

  constructor(
    protected override filterService: FilterService,
    private fb: FormBuilder,
    private paymentService: PurchasePaymentsService,
    private purchasesService: PurchasesService,
    private suppliersService: SuppliersService,
    private route: ActivatedRoute,
    private paymentMethodsService: PaymentMethodsService,
    public lang: LanguageService,
    private ExpensesItemService: ExpensesItemsService,
  ) {
    super(filterService);
    this.initForm();
  }

  override ngOnInit() {
    super.ngOnInit();

    this.purchaseId = +this.route.snapshot.params['id'];

    this.filterForm.get('purchaseId')?.setValue(this.purchaseId);

    this.loadInitialData();
  }

  private loadInitialData() {
    combineLatest({
      purchase: this.purchasesService.getPurchase(this.purchaseId),
      paymentMethods:
        this.paymentMethodsService.getPaymentMethodsListForCurrentHall(),
    })
      .pipe(
        takeUntil(this.destroyed$),
        switchMap(({purchase, paymentMethods}) => {
          this.purchase = purchase;
          this.paymentMethods = paymentMethods.items;

          if (purchase.supplier?.id) {
            return this.suppliersService.getSupplierById(
              String(purchase.supplier.id),
            );
          }

          if (purchase.expenseItem?.id) {
            return this.ExpensesItemService.getExpenseItemById(
              purchase.expenseItem.id,
            );
          }
          return of(null);
        }),
      )
      .subscribe((extraData) => {
        if (this.purchase?.supplier?.id) this.supplier = extraData as Supplier;

        if (this.purchase?.expenseItem?.id)
          this.expenseItem = extraData as ExpensesItem;
      });
  }

  private initForm() {
    this.paymentForm = this.fb.group({
      purchaseId: [null],
      amount: [null, [Validators.required, Validators.min(0)]],
      paymentType: ['Income', Validators.required],
      hallPaymentMethodId: [null],
      supplierPaymentMethodId: [null],
      itemTransferAccountId: [null],
      cashReceiverName: [null],
      posName: [null],
      paymentDate: [null, Validators.required],
      notes: [''],
    });
  }

  showPaymentForm() {
    this.isShowingForm = true;
    this.paymentForm.reset({
      purchaseId: this.purchaseId,
    });

    this.paymentForm.get('paymentType')?.enable();

    this.isEditMode = false;
  }

  hidePaymentForm() {
    this.isEditMode = false;
    this.isShowingForm = false;
    this.paymentForm.reset();
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    this.paymentService
      .getPayments(filters)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((response) => {
        this.payments = response.items;
        this.totalRecords = response.totalItems;
      });
  }

  editPayment(payment: any) {
    this.isShowingForm = true;

    // Assign the selected payment for edit purpose.
    this.selectedPaymentId = payment?.id;

    this.paymentService.getPayment(payment.id).subscribe({
      next: () => {
        const patchValues = {
          purchaseId: this.purchaseId,
          amount: payment.amount,
          paymentType: payment.paymentType,
          hallPaymentMethodId: payment.hallPaymentMethod?.id,
          itemTransferAccountId: payment.itemTransferAccount?.id,
          supplierPaymentMethodId: payment.supplierPaymentMethod?.id,
          cashReceiverName: payment.cashReceiverName,
          posName: payment.posName,
          paymentDate: payment.paymentDate,
          notes: payment.notes,
        };

        this.paymentForm.reset();
        this.paymentForm.patchValue(patchValues);
        this.paymentForm.get('paymentType')?.disable({emitEvent: false});
        this.isEditMode = true; // Check to switch from create to update mode.
      },
    });
  }

  deletePayment(payment: any) {
    this.paymentService
      .deletePayment(payment.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.loadDataTable(this.filters);
        this.loadInitialData();
      });
  }

  submit() {
    if (this.paymentForm.valid) {
      const payload = {
        ...this.paymentForm.value,
        paymentDate: dateToGregorianIsoString(
          this.paymentForm.get('paymentDate')?.value,
        ),
      };

      if (!this.isEditMode) {
        this.createPurchasePayment(payload);

        return;
      }

      this.updatePurchasePayment(payload);
    }
  }

  private createPurchasePayment(payload: any) {
    this.paymentService
      .createPayment(payload)
      .pipe(
        takeUntil(this.destroyed$),
        switchMap(() => {
          return this.purchasesService.getPurchase(this.purchaseId);
        }),
      )
      .subscribe({
        next: (updatedPurchase) => {
          this.purchase = updatedPurchase;
          this.hidePaymentForm();
          this.loadDataTable(this.filters);
        },
      });
  }

  private updatePurchasePayment(payload: any) {
    const {purchaseId, ...rest} = payload;
    this.paymentService
      .updatePayment(this.selectedPaymentId!, rest)
      .pipe(
        takeUntil(this.destroyed$),
        switchMap(() => {
          return this.purchasesService.getPurchase(this.purchaseId);
        }),
      )
      .subscribe({
        next: (updatedPurchase) => {
          this.purchase = updatedPurchase;
          this.hidePaymentForm();
          this.loadDataTable(this.filters);
          this.isEditMode = false;
        },
      });
  }

  cancel() {
    this.hidePaymentForm();
  }

  override ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    super.ngOnDestroy();
  }
}

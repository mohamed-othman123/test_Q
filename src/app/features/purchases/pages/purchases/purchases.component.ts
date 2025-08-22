import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
} from '@angular/core';
import {Router} from '@angular/router';
import {FilterService} from '@core/services/filter.service';
import {Filter} from '@core/interfaces';
import {DataTableFilter, Item, PurchaseItems} from '@core/models';
import {HallsService} from '@halls/services/halls.service';
import {PurchasesService} from '../../services/purchases.service';
import {PurchaseModel} from '../../models/purchase-model';
import {AuthService, LanguageService} from '@core/services';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {stringifyDate} from '@shared/components/date-picker/helper/date-helper';
import {Table} from 'primeng/table';
import {ExpensesType} from '@purchases/constants/purchase.constants';
import {PermissionsService} from '@core/services/permissions.service';
import {PermissionTypes} from '@auth/models';
import moment from 'moment';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.scss'],
  standalone: false,
})
export class PurchasesComponent extends Filter implements OnInit, OnDestroy {
  @ViewChild('dt2')
  override dataTable!: Table;

  purchases: PurchaseModel[] = [];
  selectedItems: PurchaseModel[] = [];
  loading = false;
  currentLang!: string;
  tooltipVisible = false;
  statusTooltipVisible = false;
  selectedStatusItem: PurchaseModel | null = null;

  showDeleteConfirmation = false;
  selectedPurchaseId: number | null = null;

  invoiceTypes: Item[] = [];
  purchaseStatuses: Item[] = [];

  expenseType: Item[] = ExpensesType;

  protected override filterConfig: {[key: string]: unknown} = {
    invoiceReference: [null],
    type: [null],
    supplierName: [null],
    purchaseDate: [null],
    totalAmount: [null],
    status: [null],
    invoiceType: [null],
    hallId: [null],
    dueDate: [null],
  };

  constructor(
    private purchasesService: PurchasesService,
    private hallsService: HallsService,
    protected override filterService: FilterService,
    private router: Router,
    private translate: TranslateService,
    public lang: LanguageService,
    private http: HttpClient,
    public permissionsService: PermissionsService,
    private authService: AuthService,
  ) {
    super(filterService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.currentLang = this.translate.currentLang;
    this.loadPurchaseItems();

    const langSub = this.translate.onLangChange.subscribe(() => {
      this.currentLang = this.translate.currentLang;
    });
    this.subs.add(langSub);

    const hallSub = this.hallsService.currentHall$.subscribe((hall) => {
      if (hall) {
        this.filterForm.get('hallId')?.setValue(hall.id);
      }
    });
    this.subs.add(hallSub);
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    this.loading = true;

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

    const sub = this.purchasesService.getPurchases(formattedFilters).subscribe(
      (response) => {
        this.purchases = response.items;
        this.totalRecords = response.totalItems;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading purchases:', error);
        this.loading = false;
      },
    );

    this.subs.add(sub);
  }

  addNewPurchase(): void {
    this.router.navigate(['/purchases/add-new-purchase']);
  }

  editPurchase(purchase: PurchaseModel): void {
    this.router.navigate(['/purchases/edit', purchase.id]);
  }

  viewPurchase(purchase: PurchaseModel): void {
    this.router.navigate(['/purchases/view', purchase.id]);
  }

  navigateToPayments(purchase: PurchaseModel): void {
    this.router.navigate(['/purchases/payments', purchase.id]);
  }

  navigateToSettlement(purchase: PurchaseModel) {
    this.router.navigate(['/purchases/settlements', purchase.id]);
  }

  openDeleteConfirmation(id: number) {
    this.selectedPurchaseId = id;
    this.showDeleteConfirmation = true;
  }

  confirmDeletePurchase(): void {
    this.deletePurchase(this.selectedPurchaseId!);
    this.selectedPurchaseId = null;
    this.showDeleteConfirmation = false;
  }
  rejectDeletePurchase(): void {
    this.selectedPurchaseId = null;
    this.showDeleteConfirmation = false;
  }

  deletePurchase(id: number): void {
    this.purchasesService.deletePurchase(id!).subscribe(() => {
      this.loadDataTable(this.filters);
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.tooltipVisible = false;
  }

  @HostListener('document:click')
  closeStatusTooltip() {
    this.statusTooltipVisible = false;
    this.selectedStatusItem = null;
  }

  onClickStatus(purchase: PurchaseModel, event: MouseEvent) {
    event.stopPropagation();
    this.selectedStatusItem = purchase;
    this.statusTooltipVisible = true;
  }

  private loadPurchaseItems(): void {
    const sub = this.http
      .get<PurchaseItems>('assets/lovs/purchase-items.json')
      .subscribe({
        next: (data) => {
          this.invoiceTypes = data.invoiceTypes;
          this.purchaseStatuses = data.purchaseStatuses;
        },
      });

    this.subs.add(sub);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  hasPermissionTo(
    action: 'update' | 'delete' | 'view' | 'payment' | 'print',
    purchase: PurchaseModel,
  ) {
    const isOwner =
      purchase.created_by === this.authService.userData?.user.userId;
    const canEdit =
      isOwner ||
      this.authService.userData?.user.permissionType ===
        PermissionTypes.GENERAL;

    const isActive = purchase.status !== 'Canceled';

    const isPaid = purchase.status === 'Completed';

    const isGeneralExpense = purchase.category?.type === 'General';

    switch (action) {
      case 'update':
        return (
          this.permissionsService.hasPermission('update:expense') &&
          canEdit &&
          isActive
        );
      case 'view':
        return (
          this.permissionsService.hasPermission('read:expenses') && isActive
        );

      case 'payment':
        return (
          this.permissionsService.hasPermission('read:expenses') &&
          this.permissionsService.hasPermission('create:expense payments') &&
          this.permissionsService.hasPermission('update:expense payments') &&
          canEdit
        );
      case 'delete':
        return (
          this.permissionsService.hasPermission('delete:expense') &&
          canEdit &&
          isActive
        );
      case 'print':
        return isPaid && !isGeneralExpense;

      default:
        return false;
    }
  }
}

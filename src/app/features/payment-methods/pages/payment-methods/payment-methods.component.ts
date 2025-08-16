import {Component, OnInit, ViewChild} from '@angular/core';
import {Filter} from '@core/interfaces';
import {DataTableFilter, Item} from '@core/models';
import {AuthService, FilterService} from '@core/services';
import {DrawerService} from '@core/services/drawer.service';
import {TranslateService} from '@ngx-translate/core';
import {PaymentMethod, PaymentType} from '@paymentmethods/models/payment.model';
import {PaymentMethodsService} from '@paymentmethods/services/payment-methods.service';
import {HallsService} from '@halls/services/halls.service';
import {Hall} from '@halls/models/halls.model';
import {Table} from 'primeng/table';
import {PermissionsService} from '@core/services/permissions.service';
import {PermissionTypes} from '@auth/models';

@Component({
    selector: 'app-payment-methods',
    templateUrl: './payment-methods.component.html',
    styleUrl: './payment-methods.component.scss',
    standalone: false
})
export class PaymentMethodsComponent extends Filter implements OnInit {
  @ViewChild('dt2')
  override dataTable!: Table;

  paymentMethods: PaymentMethod[] = [];
  selectedItems!: PaymentMethod;
  paymentMethod: PaymentMethod | null = null;
  currentHall: Hall | null = null;
  paymentTypeOptions: Item[] = [];

  protected override filterConfig: {[key: string]: unknown} = {
    name: [null],
    type: [null],
    description: [null],
    hallId: [null],
  };

  currentLang: string = 'ar';
  paymentTypes: PaymentType[] = [];

  constructor(
    private paymentMethodsService: PaymentMethodsService,
    private lang: TranslateService,
    protected override filterService: FilterService,
    public drawerService: DrawerService,
    private hallsService: HallsService,
    public permissionsService: PermissionsService,
    private auth: AuthService,
  ) {
    super(filterService);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.setupLanguageAndHall();

    this.paymentMethodsService.getPaymentTypeOptions().subscribe((options) => {
      this.paymentTypeOptions = options;
    });
  }

  private setupLanguageAndHall() {
    this.currentLang = this.lang.currentLang;
    const langSub = this.lang.onLangChange.subscribe((lang) => {
      this.currentLang = lang.lang;
      this.updatePaymentTypes();
    });
    this.subs.add(langSub);

    const hallSub = this.hallsService.currentHall$.subscribe((hall) => {
      this.currentHall = hall;
      if (hall) {
        this.filterForm.patchValue({hallId: hall.id});
      }
    });
    this.subs.add(hallSub);

    this.updatePaymentTypes();
  }

  private updatePaymentTypes() {
    this.paymentTypes = [
      {
        name: this.currentLang == 'en' ? 'Revenue' : 'ايرادات',
        code: 'Revenue',
      },
      {
        name: this.currentLang == 'en' ? 'Expenses' : 'نفقات',
        code: 'Expenses',
      },
    ];
  }

  protected override loadDataTable(filters: DataTableFilter) {
    if (this.currentHall) {
      const hallFilters = {
        ...filters,
        hallId: this.currentHall.id,
      };

      const sub = this.paymentMethodsService
        .getListPaymentMethods(hallFilters)
        .subscribe((response) => {
          this.paymentMethods = response.items;
          this.totalRecords = response.totalItems;
        });

      this.subs.add(sub);
    }
  }

  addNewPaymentMethod() {
    this.drawerService.open({
      mode: 'add',
      title: 'paymentMethods.addNewPaymentMethod',
      data: {hallId: this.currentHall?.id},
    });
  }

  updatePaymentMethod(event: Event, paymentMethod: PaymentMethod) {
    event.stopPropagation();
    this.drawerService.open({
      mode: 'edit',
      title: 'paymentMethods.updatePaymentMethod',
      data: paymentMethod,
    });
  }

  viewPaymentMethod(paymentMethod: PaymentMethod) {
    this.drawerService.open({
      mode: 'view',
      title: 'paymentMethods.viewPaymentMethod',
      data: paymentMethod,
    });
  }

  deletePaymentMethod(paymentMethod: PaymentMethod) {
    this.confirmDeletePaymentMethod(paymentMethod);
  }

  confirmDeletePaymentMethod(paymentMethod: PaymentMethod) {
    const sub = this.paymentMethodsService
      .deletePaymentMethod(paymentMethod?.id!)
      .subscribe(() => {
        this.loadDataTable(this.filters);
      });

    this.subs.add(sub);
  }

  refreshDataTable(): void {
    this.loadDataTable(this.filters);
  }

  hasPermissionTo(
    action: 'update' | 'delete' | 'view',
    paymentMethod: PaymentMethod,
  ) {
    const isOwner =
      paymentMethod.created_by === this.auth.userData?.user.userId;
    const canEdit =
      isOwner ||
      this.auth.userData?.user.permissionType === PermissionTypes.GENERAL;

    switch (action) {
      case 'update':
        return (
          canEdit &&
          this.permissionsService.hasPermission('update:paymentMethod')
        );
      case 'delete':
        return (
          canEdit &&
          this.permissionsService.hasPermission('delete:paymentMethod')
        );
      case 'view':
        return this.permissionsService.hasPermission('read:paymentMethods');
      default:
        return false;
    }
  }
}

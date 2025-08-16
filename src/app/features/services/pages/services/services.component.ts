import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {PermissionTypes} from '@auth/models';
import {Filter} from '@core/interfaces';
import {DataTableFilter, TableData} from '@core/models';
import {AuthService, FilterService, LanguageService} from '@core/services';
import {PermissionsService} from '@core/services/permissions.service';
import {Hall} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {Service} from '@services/models';
import {ServicesService} from '@services/services/services.service';
import {Table} from 'primeng/table';
import {TranslateService, LangChangeEvent} from '@ngx-translate/core';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-services',
    templateUrl: './services.component.html',
    styleUrl: './services.component.scss',
    standalone: false
})
export class ServicesComponent extends Filter implements OnInit {
  @ViewChild('dt2')
  override dataTable!: Table;

  serviceProviderType = [
    {value: 'hall', label: {en: 'hall', ar: 'القاعة'}},
    {value: 'supplier', label: {en: 'supplier', ar: 'المورد'}},
    {value: 'thirdParty', label: {en: 'thirdParty', ar: 'طرف ثالث'}},
  ];

  services!: Service[];
  currentHall: Hall | null = null;
  showDeleteConfirmation = false;
  selectedServiceId: number | null = null;
  langSub: Subscription = new Subscription();

  protected override filterConfig: {[key: string]: unknown} = {
    name: [null],
    price: [null],
    cost: [null],
    note: [null],
    hallId: [null],
    providerType: [null],
  };

  constructor(
    private servicesService: ServicesService,
    protected override filterService: FilterService,
    private hallsService: HallsService,
    private router: Router,
    public lang: LanguageService,
    public permissionsService: PermissionsService,
    private auth: AuthService,
    private translate: TranslateService,
  ) {
    super(filterService);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    const hallSub = this.hallsService.currentHall$.subscribe((hall) => {
      this.currentHall = hall;
      if (hall) {
        this.filterForm.get('hallId')?.setValue(hall.id, {emitEvent: false});
      }
    });
    this.subs.add(hallSub);

    this.langSub = this.translate.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        if (this.services && this.services.length > 0) {
          this.refreshData();
        }
      },
    );
    this.subs.add(this.langSub);
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    if (!this.currentHall) return;

    const queryFilters = {
      ...filters,
      hallId: this.currentHall.id,
    };

    const sub = this.servicesService
      .getServices(queryFilters)
      .subscribe((services: TableData<Service>) => {
        this.services = services.items;
        this.totalRecords = services.totalItems;
      });
    this.subs.add(sub);
  }

  refreshData() {
    this.loadDataTable(this.filters);
  }

  addNewService() {
    this.router.navigate(['services/add']);
  }

  updateService(serviceId: number) {
    this.router.navigate(['services/edit', serviceId]);
  }

  viewService(serviceId: number) {
    this.router.navigate(['services/view', serviceId]);
  }

  openDeleteConfirmation(id: number) {
    this.selectedServiceId = id;
    this.showDeleteConfirmation = true;
  }

  confirmDeleteService() {
    this.deleteService(this.selectedServiceId!);
    this.selectedServiceId = null;
    this.showDeleteConfirmation = false;
  }

  deleteService(id: number) {
    this.servicesService.deleteService(id).subscribe(() => {
      this.refreshData();
    });
  }

  rejectDeleteService(): void {
    this.selectedServiceId = null;
    this.showDeleteConfirmation = false;
  }

  getServicePriceByHallId(service: Service, hallId: number) {
    return service.halls.find((item) => item.id === hallId)?.price || 0;
  }

  getServiceCostByHallId(service: Service, hallId: number) {
    return service.halls.find((item) => item.id === hallId)?.cost || 0;
  }

  getProviderTypeDisplay(service: Service, hallId: number): string {
    const hall = service.halls.find((item) => item.id === hallId);

    if (!hall) return '-';

    switch (hall.providerType) {
      case 'hall':
        return this.translate.instant('services.hallName');
      case 'thirdParty':
        return this.translate.instant('services.thirdParty');
      case 'supplier':
        return this.translate.instant('services.supplier');
      default:
        return '-';
    }
  }

  hasPermissionTo(action: 'delete' | 'update', service: Service): boolean {
    const isOwner = service.created_by === this.auth.userData?.user?.userId;
    const canEdit =
      isOwner ||
      this.auth.userData?.user.permissionType === PermissionTypes.GENERAL;

    switch (action) {
      case 'delete':
        return (
          this.permissionsService.hasPermission('delete:service') && canEdit
        );
      case 'update':
        return (
          this.permissionsService.hasPermission('update:service') && canEdit
        );
      default:
        return false;
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.langSub.unsubscribe();
  }
}

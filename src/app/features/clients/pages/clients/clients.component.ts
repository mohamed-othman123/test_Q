import {Component, OnInit, ViewChild} from '@angular/core';
import {PermissionTypes} from '@auth/models';
import {Client} from '@clients/models/client.model';
import {CustomersService} from '@clients/services/Customers.service';
import {Filter} from '@core/interfaces';
import {DataTableFilter, Item} from '@core/models';
import {AuthService, FilterService} from '@core/services';
import {DrawerService} from '@core/services/drawer.service';
import {PermissionsService} from '@core/services/permissions.service';
import {HallsService} from '@halls/services/halls.service';
import {TranslateService} from '@ngx-translate/core';
import {Table} from 'primeng/table';
import {Router} from '@angular/router';

@Component({
    selector: 'app-clients',
    templateUrl: './clients.component.html',
    styleUrl: './clients.component.scss',
    standalone: false
})
export class ClientsComponent extends Filter implements OnInit {
  clients: Client[] = [];
  selectedItems!: Client;
  client: null | Client = null;
  clientTypes: Item[] = [];

  @ViewChild('dt2')
  override dataTable!: Table;

  protected override filterConfig: {[key: string]: unknown} = {
    name: [null],
    phone: [null],
    email: [null],
    type: [null],
    hallId: [this.hallsService.getCurrentHall()?.id],
  };

  constructor(
    private customerService: CustomersService,
    protected override filterService: FilterService,
    private hallsService: HallsService,
    private drawerService: DrawerService,
    public translate: TranslateService,
    public permissionsService: PermissionsService,
    private authService: AuthService,
    private router: Router,
  ) {
    super(filterService);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.hallsService.currentHall$.subscribe((hall) => {
      this.filterForm.get('hallId')?.setValue(hall?.id);
    });

    this.customerService.getClientTypes().subscribe((types) => {
      this.clientTypes = types;
    });
  }

  protected override loadDataTable(filters: DataTableFilter) {
    if (!this.hallsService.getCurrentHall()) {
      this.clients = [];
      this.totalRecords = 0;
      return;
    }

    const sub = this.customerService
      .getClients({
        ...filters,
        hallId: this.hallsService.getCurrentHall()?.id,
      })
      .subscribe((res) => {
        this.clients = res.items;
        this.totalRecords = res.totalItems;
      });

    this.subs.add(sub);
  }

  addNewClient() {
    this.drawerService.open({
      mode: 'add',
      title: 'clients.addNewClient',
    });
  }

  editClient(event: Event, client: Client) {
    event.stopPropagation();
    if (!this.hallsService.getCurrentHall()) {
      return;
    }
    this.customerService.getClientById(client.id).subscribe((res) => {
      this.drawerService.open({
        mode: 'edit',
        title: 'clients.updateClient',
        data: res,
      });
    });
  }

  viewClient(client: Client) {
    this.router.navigate(['clients/details', client.id]);
  }

  confirmDeleteClient(client: Client) {
    if (!this.hallsService.getCurrentHall()) {
      return;
    }

    this.deleteClient(client);
  }

  deleteClient(client: Client) {
    this.customerService.deleteClient(client.id).subscribe(() => {
      this.refreshDataTable();
    });
  }

  refreshDataTable() {
    this.loadDataTable(this.filters);
  }
  hasPermissionTo(action: 'update' | 'delete' | 'view', client: Client) {
    const isOwner =
      client.created_by === this.authService.userData?.user.userId;

    const canEdit =
      isOwner ||
      this.authService.userData?.user.permissionType ===
        PermissionTypes.GENERAL;

    switch (action) {
      case 'delete':
        return (
          this.permissionsService.hasPermission('delete:hallsClients') &&
          canEdit
        );
      case 'update':
        return (
          this.permissionsService.hasPermission('update:hallsClients') &&
          canEdit
        );
      case 'view':
        return this.permissionsService.hasPermission('read:hallsClients');
      default:
        return false;
    }
  }
}

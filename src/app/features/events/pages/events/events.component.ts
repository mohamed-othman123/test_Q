import {Component, OnInit, ViewChild} from '@angular/core';
import {Filter} from '@core/interfaces';
import {DataTableFilter} from '@core/models';
import {AuthService, FilterService} from '@core/services';
import {DrawerService} from '@core/services/drawer.service';
import {Event as EventModel} from '@events/models/events.model';
import {EventsService} from '@events/services/events.service';
import {HallsService} from '@halls/services/halls.service';
import {Hall} from '@halls/models/halls.model';
import {TranslateService} from '@ngx-translate/core';
import {stringifyDate} from '@shared/components/date-picker/helper/date-helper';
import {Table} from 'primeng/table';
import {PermissionsService} from '@core/services/permissions.service';
import {PermissionTypes} from '@auth/models';

@Component({
    selector: 'app-events',
    templateUrl: './events.component.html',
    styleUrl: './events.component.scss',
    standalone: false
})
export class EventsComponent extends Filter implements OnInit {
  @ViewChild('dt2')
  override dataTable!: Table;

  events: EventModel[] = [];
  selectedItems!: EventModel;
  event: EventModel | null = null;
  currentHall: Hall | null = null;

  protected override filterConfig: {[key: string]: unknown} = {
    name: [null],
    name_ar: [null],
    description: [null],
    creationDate: [null],
  };

  constructor(
    protected override filterService: FilterService,
    private eventsService: EventsService,
    private hallsService: HallsService,
    private drawerService: DrawerService,
    public translateService: TranslateService,
    public permissionsService: PermissionsService,
    private auth: AuthService,
  ) {
    super(filterService);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.hallsService.currentHall$.subscribe((hall) => {
      this.currentHall = hall;
      if (hall) {
        this.loadDataTable(this.filters);
      }
    });
  }

  protected override loadDataTable(filters: DataTableFilter) {
    if (!this.currentHall?.id) return;

    const formattedFilters = {...filters};

    if (
      formattedFilters['creationDate'] &&
      typeof formattedFilters['creationDate'] !== 'string'
    ) {
      formattedFilters['creationDate'] = stringifyDate(
        formattedFilters['creationDate'],
      );
    }

    const hallFilters = {
      ...formattedFilters,
      hallId: this.currentHall.id,
    };

    this.eventsService.getListEvents(hallFilters).subscribe((response: any) => {
      this.events = response.items;
      this.totalRecords = response.totalItems;
    });
  }

  addNewEvent() {
    this.drawerService.open({
      mode: 'add',
      title: 'events.addNewEvent',
    });
  }

  updateEvent(event: Event, eventData: EventModel) {
    event.stopPropagation();
    this.drawerService.open({
      mode: 'edit',
      title: 'events.updateEvent',
      data: eventData,
    });
  }

  viewEvent(event: EventModel) {
    this.drawerService.open({
      mode: 'view',
      title: 'events.viewEvent',
      data: event,
    });
  }

  deleteEvent(event: EventModel) {
    this.confirmDeleteEvent(event);
  }

  confirmDeleteEvent(event: EventModel) {
    this.eventsService.deleteEvent(event?.id!).subscribe(() => {
      this.refreshDataTable();
    });
  }

  refreshDataTable(): void {
    this.loadDataTable(this.filters);
  }

  hasPermissionTo(action: 'update' | 'delete' | 'view', event: EventModel) {
    const isOwner = event.created_by === this.auth.userData?.user.userId;
    const canEdit =
      isOwner ||
      this.auth.userData?.user.permissionType === PermissionTypes.GENERAL;

    switch (action) {
      case 'update':
        return (
          canEdit && this.permissionsService.hasPermission('update:events')
        );
      case 'delete':
        return (
          canEdit && this.permissionsService.hasPermission('delete:events')
        );
      case 'view':
        return this.permissionsService.hasPermission('read:events');
      default:
        return false;
    }
  }
}

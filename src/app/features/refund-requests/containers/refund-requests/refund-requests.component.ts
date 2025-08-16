import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PermissionTypes} from '@auth/models';
import {Filter} from '@core/interfaces';
import {DataTableFilter, Item} from '@core/models';
import {AuthService, FilterService} from '@core/services';
import {PermissionsService} from '@core/services/permissions.service';
import {Hall} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {TranslateService} from '@ngx-translate/core';
import {RefundStatusTypes} from '@refund-requests/constants/refund-status.constant';
import {
  RefundRequest,
  RefundStatus,
} from '@refund-requests/models/refund-request.model';
import {RefundRequestsService} from '@refund-requests/services/refund-request.service';
import {stringifyDate} from '@shared/components/date-picker/helper/date-helper';
import {Table} from 'primeng/table';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'refund-requests',
  templateUrl: './refund-requests.component.html',
  styleUrls: ['./refund-requests.component.scss'],
  standalone: false,
})
export class RefundRequestComponent
  extends Filter
  implements OnInit, OnDestroy
{
  @ViewChild('dt2')
  override dataTable!: Table;

  showDeleteConfirmation = false;
  selectedServiceId: number | null = null;
  refundRequests!: RefundRequest[];
  currentHall: Hall | null = null;
  refundStatusTypes: Item[] = [
    ...RefundStatusTypes,
    {value: RefundStatus.REJECTED, label: {ar: 'ملغي', en: 'Canceled'}},
  ];
  protected override filterConfig: {[key: string]: unknown} = {
    status: [null],
    request_date: [null],
    amount: [null],
    clientName: [null],
    bookingReference: [null],
  };

  private unsubscribeAll: Subject<void> = new Subject();
  constructor(
    protected override filterService: FilterService,
    private hallsService: HallsService,
    private refundRequestsService: RefundRequestsService,
    public translate: TranslateService,
    private auth: AuthService,
    private permissionsService: PermissionsService,
  ) {
    super(filterService);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.hallsService.currentHall$
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((hall) => {
        this.currentHall = hall;
        if (hall) {
          this.filterForm.patchValue({hallId: hall.id});
        }
      });
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    if (this.currentHall) {
      let hallFilters: any = {
        ...filters,
        hallId: this.currentHall.id,
      };

      if (
        hallFilters['request_date'] &&
        typeof hallFilters['request_date'] !== 'string'
      ) {
        hallFilters['request_date'] = stringifyDate(
          hallFilters['request_date'],
        );
      }

      this.refundRequestsService
        .getAll(hallFilters)
        .pipe(takeUntil(this.unsubscribeAll))
        .subscribe((response) => {
          this.refundRequests = response.items;
          this.totalRecords = response.totalItems;
        });
    }
  }

  deleteRefundRequest(id: number) {
    this.refundRequestsService
      .deleteOne(id!)
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(() => {
        this.loadDataTable(this.filters);
      });
  }

  refreshDataTable(): void {
    this.loadDataTable(this.filters);
  }

  openDeleteConfirmation(id: number) {
    this.selectedServiceId = id;
    this.showDeleteConfirmation = true;
  }

  confirmDeleteRequest() {
    this.deleteRefundRequest(this.selectedServiceId!);
    this.selectedServiceId = null;
    this.showDeleteConfirmation = false;
  }

  rejectDeleteRequest(): void {
    this.selectedServiceId = null;
    this.showDeleteConfirmation = false;
  }

  hasPermissionTo(
    action: 'update' | 'delete',
    refundRequest: RefundRequest,
  ): boolean {
    const isOwner =
      refundRequest.created_by === this.auth.userData?.user?.userId;
    const canEdit =
      isOwner ||
      this.auth.userData?.user.permissionType === PermissionTypes.GENERAL;

    const isCompleted = refundRequest.status === 'completed';

    switch (action) {
      case 'delete':
        return (
          this.permissionsService.hasPermission('delete:refund request') &&
          canEdit &&
          !isCompleted
        );
      case 'update':
        return (
          this.permissionsService.hasPermission('update:refund request') &&
          canEdit &&
          !isCompleted
        );
      default:
        return false;
    }
    return true;
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }
}

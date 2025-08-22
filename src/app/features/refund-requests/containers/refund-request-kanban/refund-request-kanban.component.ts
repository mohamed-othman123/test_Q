import {CdkDragDrop, transferArrayItem} from '@angular/cdk/drag-drop';
import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Filter} from '@core/interfaces';
import {DataTableFilter} from '@core/models';
import {FilterService, LanguageService} from '@core/services';
import {HallsService} from '@halls/services/halls.service';
import {RefundRequest} from '@refund-requests/models/refund-request.model';
import {RefundRequestsService} from '@refund-requests/services/refund-request.service';
import {stringifyDate} from '@shared/components/date-picker/helper/date-helper';
import moment from 'moment';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-refund-request-kanban',
  standalone: false,
  templateUrl: './refund-request-kanban.component.html',
  styleUrl: './refund-request-kanban.component.scss',
})
export class RefundRequestKanbanComponent extends Filter implements OnInit {
  override filterConfig: {[key: string]: unknown} = {
    request_date: [null],
    amount: [null],
    clientName: [null],
    bookingReference: [null],
  };

  override rows = 10;

  columns = ['new', 'in_progress', 'completed', 'rejected'];

  data: {[key: string]: RefundRequest[]} = {
    new: [],
    in_progress: [],
    completed: [],
    rejected: [],
  };

  totalItems: {[key: string]: number} = {
    new: 0,
    in_progress: 0,
    completed: 0,
    rejected: 0,
  };

  showRejectionNotePopup = false;

  rejectedRequestEvent: CdkDragDrop<RefundRequest[]> | null = null;

  rejectReason = new FormControl<string>('', {
    validators: Validators.required,
  });

  constructor(
    protected override filterService: FilterService,
    private refundRequestsService: RefundRequestsService,
    public lang: LanguageService,
    private hallsService: HallsService,
    private router: Router,
  ) {
    super(filterService);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.loadDataTable(this.filters);
  }

  protected override loadDataTable(filters: DataTableFilter) {
    const {request_date, ...restFilters} = filters;

    // if startDate is not null then check if it valid date and assign it to filters
    if (request_date) {
      const date = stringifyDate(request_date);
      if (!moment(date).isValid()) return;
      restFilters['request_date'] = date;
    }
    restFilters['hallId'] = this.hallsService.getCurrentHall()?.id;
    restFilters['sortBy'] = 'created_at';
    restFilters['sortOrder'] = 'DESC';

    restFilters['limit'] = this.rows;

    this.subs.add(
      forkJoin({
        new: this.refundRequestsService.getAll({
          status: 'new',
          ...restFilters,
        }),
        in_progress: this.refundRequestsService.getAll({
          status: 'in_progress',
          ...restFilters,
        }),
        completed: this.refundRequestsService.getAll({
          status: 'completed',
          ...restFilters,
        }),
        canceled: this.refundRequestsService.getAll({
          status: 'rejected',
          ...restFilters,
        }),
      }).subscribe((response) => {
        this.data['new'] = response.new.items;
        this.data['in_progress'] = response.in_progress.items;
        this.data['completed'] = response.completed.items;
        this.data['rejected'] = response.canceled.items;

        this.totalItems['new'] = response.new.totalItems;
        this.totalItems['in_progress'] = response.in_progress.totalItems;
        this.totalItems['completed'] = response.completed.totalItems;
        this.totalItems['rejected'] = response.canceled.totalItems;
      }),
    );
  }

  onItemDropped(event: CdkDragDrop<RefundRequest[]>) {
    const {previousContainer, container} = event;
    const previousStatus = previousContainer.id;
    const currentStatus = container.id;
    const item = event.item.data;
    const itemId = item.id;

    if (previousStatus === currentStatus) return;

    if (currentStatus === 'rejected') {
      this.rejectedRequestEvent = event;
      this.showRejectionNotePopup = true;
      return;
    }

    this.totalItems[previousStatus]--;
    this.totalItems[currentStatus]++;

    this.refundRequestsService
      .updateRefundStatus(itemId, {status: currentStatus})
      .subscribe(() => {
        transferArrayItem(
          previousContainer.data,
          container.data,
          event.previousIndex,
          0,
        );
      });
  }

  saveRejectionNote() {
    if (!this.rejectedRequestEvent || !this.rejectReason.value) {
      this.rejectReason.markAsTouched();
      return;
    }

    const {previousContainer, container} = this.rejectedRequestEvent;
    const previousStatus = previousContainer.id;
    const currentStatus = container.id;
    const item = this.rejectedRequestEvent.item.data;
    const itemId = item.id;
    const rejectReason = this.rejectReason.value;

    this.totalItems[previousStatus]--;
    this.totalItems[currentStatus]++;

    this.refundRequestsService
      .updateRefundStatus(itemId, {
        status: 'rejected',
        rejectReason,
      })
      .subscribe(() => {
        if (!this.rejectedRequestEvent) return;

        transferArrayItem(
          previousContainer.data,
          container.data,
          this.rejectedRequestEvent.previousIndex,
          0,
        );

        this.showRejectionNotePopup = false;
        this.rejectedRequestEvent = null;
        this.rejectReason.setValue('');
      });
  }
}

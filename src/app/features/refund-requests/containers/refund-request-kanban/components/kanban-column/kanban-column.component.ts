import {CdkDragDrop, CdkDragExit} from '@angular/cdk/drag-drop';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {Router} from '@angular/router';
import {HallsService} from '@halls/services/halls.service';
import {RefundRequest} from '@refund-requests/models/refund-request.model';
import {RefundRequestsService} from '@refund-requests/services/refund-request.service';

@Component({
  selector: 'app-kanban-column',
  standalone: false,
  templateUrl: './kanban-column.component.html',
  styleUrl: './kanban-column.component.scss',
})
export class KanbanColumnComponent implements OnChanges {
  @Input() title: string = '';
  @Input() items: RefundRequest[] = [];
  @Input() filters: {[key: string]: unknown} = {};
  @Input() totalItems: number = 0;
  @Input() canDragFrom: boolean = false;

  @Output() itemDropped = new EventEmitter<CdkDragDrop<RefundRequest[]>>();

  page = 1;
  limit = 5;

  constructor(
    private refundRequestsService: RefundRequestsService,
    private hallsService: HallsService,
    private router: Router,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] || changes['filters']) {
      this.page = 1; // Reset page when title or filters change
    }
  }

  handleDrop(event: CdkDragDrop<RefundRequest[]>) {
    this.itemDropped.emit(event);
  }

  loadMore() {
    this.page++;

    this.filters['page'] = this.page;
    this.filters['status'] = this.title;
    this.filters['limit'] = this.limit;
    const hallId = this.hallsService.getCurrentHall()?.id;

    this.refundRequestsService
      .getAll({hallId, ...this.filters})
      .subscribe((newItems) => {
        this.items.push(...newItems.items);
      });
  }

  canLoadMore(): boolean {
    return this.page * this.limit >= this.totalItems;
  }

  view(item: RefundRequest) {
    this.router.navigate(['refund-requests', 'view', item.id]);
  }
}

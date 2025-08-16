import {Component, Input} from '@angular/core';
import {RefundRequest} from '@refund-requests/models/refund-request.model';

@Component({
  selector: 'app-kanban-card',
  standalone: false,
  templateUrl: './kanban-card.component.html',
  styleUrl: './kanban-card.component.scss',
})
export class KanbanCardComponent {
  @Input() item!: RefundRequest;
}

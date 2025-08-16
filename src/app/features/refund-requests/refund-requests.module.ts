import {NgModule} from '@angular/core';
import {RefundRequestRoutingModule} from './refund-requests-routing.module';
import {SharedModule} from '@shared/shared.module';
import {RefundRequestsService} from './services/refund-request.service';
import {RefundRequestFormComponent} from './components/refund-request-form/refund-request-form.component';
import {EditRefundRequestComponent} from './containers/edit-refund-request/edit-refund-request.component';
import {ViewRefundRequestComponent} from './containers/view-refund-request/view-refund-request.component';
import {RefundRequestKanbanComponent} from './containers/refund-request-kanban/refund-request-kanban.component';
import {KanbanColumnComponent} from './containers/refund-request-kanban/components/kanban-column/kanban-column.component';
import {KanbanCardComponent} from './containers/refund-request-kanban/components/kanban-card/kanban-card.component';

@NgModule({
  declarations: [
    RefundRequestFormComponent,
    EditRefundRequestComponent,
    ViewRefundRequestComponent,
    RefundRequestKanbanComponent,
    KanbanColumnComponent,
    KanbanCardComponent,
  ],
  imports: [RefundRequestRoutingModule, SharedModule],
  exports: [],
  providers: [RefundRequestsService],
})
export class RefundRequestModule {}

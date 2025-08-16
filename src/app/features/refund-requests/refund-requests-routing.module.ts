import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RefundRequestComponent} from './containers/refund-requests/refund-requests.component';
import {EditRefundRequestComponent} from './containers/edit-refund-request/edit-refund-request.component';
import {GetRefundRequestResolver} from './resolvers/get-refund-request.resolver';
import {ViewRefundRequestComponent} from './containers/view-refund-request/view-refund-request.component';
import {RefundRequestKanbanComponent} from './containers/refund-request-kanban/refund-request-kanban.component';

const routes: Routes = [
  {
    path: '',
    component: RefundRequestKanbanComponent,
    pathMatch: 'full',
    data: {title: 'pageTitles.refundRequests'},
  },
  {
    path: 'edit/:id',
    component: EditRefundRequestComponent,
    data: {mode: 'edit', title: 'pageTitles.updateRefundRequest'},
    resolve: {refund: GetRefundRequestResolver},
  },
  {
    path: 'view/:id',
    component: ViewRefundRequestComponent,
    data: {mode: 'view', title: 'pageTitles.viewRefundRequest'},
    resolve: {refund: GetRefundRequestResolver},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefundRequestRoutingModule {}

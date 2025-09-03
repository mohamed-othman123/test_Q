import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ViewAuditTransactionComponent} from './pages/view-audit-transaction/view-audit-transaction.component';

const routes: Routes = [
  {
    path: 'view/:id',
    component: ViewAuditTransactionComponent,
    data: {title: 'pageTitles.viewAuditTransaction'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuditTransactionsRoutingModule {}

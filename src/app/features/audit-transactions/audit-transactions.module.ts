import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AuditTransactionsRoutingModule} from './audit-transactions-routing.module';
import {ViewAuditTransactionComponent} from './pages/view-audit-transaction/view-audit-transaction.component';
import {AuditTransactionsListComponent} from './components/audit-transactions-list/audit-transactions-list.component';
import {SharedModule} from '@shared/shared.module';

@NgModule({
  declarations: [ViewAuditTransactionComponent, AuditTransactionsListComponent],
  imports: [CommonModule, AuditTransactionsRoutingModule, SharedModule],
  exports: [AuditTransactionsListComponent],
})
export class AuditTransactionsModule {}

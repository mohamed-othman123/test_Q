import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {InventoryRoutingModule} from './inventory-routing.module';
import {InventoryListComponent} from './pages/inventory-list/inventory-list.component';
import {SharedModule} from '@shared/shared.module';
import {AddNewItemComponent} from './pages/add-new-item/add-new-item.component';
import {ViewItemComponent} from './pages/view-item/view-item.component';
import {AuditTransactionsModule} from '@audit-transactions/audit-transactions.module';

@NgModule({
  declarations: [
    InventoryListComponent,
    AddNewItemComponent,
    ViewItemComponent,
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    SharedModule,
    AuditTransactionsModule,
  ],
})
export class InventoryModule {}

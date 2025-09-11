import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AccountsRoutingModule} from './accounts-routing.module';
import {AccountsComponent} from './pages/accounts/accounts.component';
import {SharedModule} from '@shared/shared.module';
import {AddNewAccountComponent} from './components/add-new-account/add-new-account.component';
import {ViewAccountsTreeComponent} from './pages/view-accounts-tree/view-accounts-tree.component';

@NgModule({
  declarations: [
    AccountsComponent,
    AddNewAccountComponent,
    ViewAccountsTreeComponent,
  ],
  imports: [CommonModule, AccountsRoutingModule, SharedModule],
})
export class AccountsModule {}

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AccountsComponent} from './pages/accounts/accounts.component';
import {ViewAccountsTreeComponent} from './pages/view-accounts-tree/view-accounts-tree.component';

const routes: Routes = [
  {
    path: '',
    component: AccountsComponent,
    data: {title: 'pageTitles.chartOfAccounts'},
  },
  {
    path: 'view/tree',
    component: ViewAccountsTreeComponent,
    data: {title: 'pageTitles.chartOfAccounts'},
  },
  {
    path: 'view/:id',
    component: ViewAccountsTreeComponent,
    data: {title: 'pageTitles.chartOfAccounts'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountsRoutingModule {}

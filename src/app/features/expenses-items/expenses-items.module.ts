import {NgModule} from '@angular/core';

import {ExpensesItemsRoutingModule} from './expenses-items-routing.module';
import {SharedModule} from '@shared/shared.module';
import {ExpensesItemsComponent} from './pages/expenses-items/expenses-items.component';
import {ExpenseItemFormComponent} from './components/expense-item-form/expense-item-form.component';
import {ExpenseElementComponent} from './components/expense-element/expense-element.component';
import { ExpenseAccountsComponent } from './components/expense-accounts/expense-accounts.component';

@NgModule({
  declarations: [
    ExpensesItemsComponent,
    ExpenseItemFormComponent,
    ExpenseElementComponent,
    ExpenseAccountsComponent,
  ],
  imports: [SharedModule, ExpensesItemsRoutingModule],
})
export class ExpensesItemsModule {}

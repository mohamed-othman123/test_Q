import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ExpenseItemFormComponent} from './components/expense-item-form/expense-item-form.component';
import {expensesItemsResolver} from './resolvers/expenses-items.resolver';

const routes: Routes = [
  {
    path: 'add',
    component: ExpenseItemFormComponent,
    data: {mode: 'add', title: 'pageTitles.addNewExpenseItem'},
    resolve: {data: expensesItemsResolver},
  },
  {
    path: 'edit/:id',
    component: ExpenseItemFormComponent,
    data: {mode: 'edit', title: 'pageTitles.editExpenseItem'},
    resolve: {data: expensesItemsResolver},
  },
  {
    path: 'view/:id',
    component: ExpenseItemFormComponent,
    data: {mode: 'view', title: 'pageTitles.viewExpenseItem'},
    resolve: {data: expensesItemsResolver},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpensesItemsRoutingModule {}

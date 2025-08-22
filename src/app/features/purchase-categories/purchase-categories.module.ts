import {NgModule} from '@angular/core';
import {PurchaseCategoriesRoutingModule} from './purchase-categories-routing.module';
import {PurchaseCategoriesComponent} from './containers/purchase-categories/purchase-categories.component';
import {SharedModule} from '@shared/shared.module';
import {PurchaseCategoriesFormComponent} from './components/purchase-categories-form/purchase-categories-form.component';
import { ViewCategoryComponent } from './containers/view-category/view-category.component';
import { ExpensesItemsListComponent } from './components/expenses-items-list/expenses-items-list.component';

@NgModule({
  declarations: [PurchaseCategoriesComponent, PurchaseCategoriesFormComponent, ViewCategoryComponent, ExpensesItemsListComponent],
  imports: [PurchaseCategoriesRoutingModule, SharedModule],
})
export class PurchaseCategoriesModule {}

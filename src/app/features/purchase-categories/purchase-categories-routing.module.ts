import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PurchaseCategoriesComponent} from './containers/purchase-categories/purchase-categories.component';
import {ViewCategoryComponent} from './containers/view-category/view-category.component';

const routes: Routes = [
  {
    path: '',
    component: PurchaseCategoriesComponent,
    pathMatch: 'full',
    data: {title: 'pageTitles.expenseCategories'},
  },
  {
    path: 'view/:categoryId',
    pathMatch: 'full',
    component: ViewCategoryComponent,

    data: {title: 'pageTitles.viewExpenseCategory'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseCategoriesRoutingModule {}

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PurchaseCategoriesComponent} from './containers/purchase-categories/purchase-categories.component';

const routes: Routes = [
  {
    path: '',
    component: PurchaseCategoriesComponent,
    pathMatch: 'full',
    data: {title: 'pageTitles.expenseCategories'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseCategoriesRoutingModule {}

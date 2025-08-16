import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DiscountsComponent} from './pages/discounts/discounts.component';
import {AddNewDiscountComponent} from './pages/add-new-discount/add-new-discount.component';

const routes: Routes = [
  {
    path: '',
    component: DiscountsComponent,
    data: {title: 'pageTitles.discounts'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiscountsRoutingModule {}

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {DiscountsRoutingModule} from './discounts-routing.module';
import {DiscountsComponent} from './pages/discounts/discounts.component';
import {AddNewDiscountComponent} from './pages/add-new-discount/add-new-discount.component';
import {SharedModule} from '@shared/shared.module';

@NgModule({
  declarations: [DiscountsComponent, AddNewDiscountComponent],
  imports: [CommonModule, DiscountsRoutingModule, SharedModule],
})
export class DiscountsModule {}

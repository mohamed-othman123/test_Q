import {NgModule} from '@angular/core';

import {SuppliersRoutingModule} from './suppliers-routing.module';
import {SuppliersComponent} from './pages/suppliers/suppliers.component';
import {SupplierFormComponent} from './components/supplier-form/supplier-form.component';
import {SharedModule} from '@shared/shared.module';
import {SupplierPaymentMethodsComponent} from './components/supplier-payment-methods/supplier-payment-methods.component';
import {CommentsModule} from '@shared/components/comments/comments.module';

@NgModule({
  declarations: [
    SuppliersComponent,
    SupplierFormComponent,
    SupplierPaymentMethodsComponent,
  ],
  imports: [SharedModule, SuppliersRoutingModule, CommentsModule],
})
export class SuppliersModule {}

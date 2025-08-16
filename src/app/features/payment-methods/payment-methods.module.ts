import {NgModule} from '@angular/core';
import {PaymentMethodsComponent} from './pages/payment-methods/payment-methods.component';
import {PaymentMethodsRoutingModule} from './payment-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '@shared/shared.module';
import {AddNewPaymentMethodComponent} from './components/add-new-payment-method/add-new-payment-method.component';

@NgModule({
  declarations: [PaymentMethodsComponent, AddNewPaymentMethodComponent],
  imports: [
    PaymentMethodsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
})
export class PaymentMethodsModule {}

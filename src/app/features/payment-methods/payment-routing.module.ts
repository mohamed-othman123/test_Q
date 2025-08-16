import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PaymentMethodsComponent} from './pages/payment-methods/payment-methods.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentMethodsComponent,
    pathMatch: 'full',
    data: {title: 'pageTitles.paymentMethods'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentMethodsRoutingModule {}

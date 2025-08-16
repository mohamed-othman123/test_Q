import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AddNewPaymentComponent, PaymentComponent} from './pages';
import {paymentResolver} from './resolvers/payment.resolver';
import {viewPaymentsResolver} from './resolvers/view-payments.resolver';

const routes: Routes = [
  {
    path: ':id',
    component: PaymentComponent,
    pathMatch: 'full',
    resolve: {resolvedData: viewPaymentsResolver},
    data: {title: 'pageTitles.viewOrder'},
  },

  {
    path: 'add-new-payment/:id',
    component: AddNewPaymentComponent,
    resolve: {resolvedData: paymentResolver},
    data: {title: 'pageTitles.orderPaymentAndRefunds'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentRoutingModule {}

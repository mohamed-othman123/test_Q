import {NgModule} from '@angular/core';

import {PaymentRoutingModule} from './payment-routing.module';
import {AddNewPaymentComponent, PaymentComponent} from './pages';
import {SharedModule} from '@shared/shared.module';
import {FormsModule} from '@angular/forms';
import {OrdersModule} from '@orders/orders.module';
import {CommentsModule} from '@shared/components/comments/comments.module';
import {RefundRequestsService} from '@refund-requests/services/refund-request.service';
import {IncomeComponent} from './components/income/income.component';
import {RefundComponent} from './components/refund/refund.component';
import {ClientPaymentMethodsComponent} from './components/client-payment-methods/client-payment-methods.component';
import {PaymentsListComponent} from './components/payments-list/payments-list.component';
import {RefundListComponent} from './components/refund-list/refund-list.component';

@NgModule({
  declarations: [
    PaymentComponent,
    AddNewPaymentComponent,
    IncomeComponent,
    RefundComponent,
    ClientPaymentMethodsComponent,
    PaymentsListComponent,
    RefundListComponent,
  ],
  imports: [
    SharedModule,
    PaymentRoutingModule,
    FormsModule,
    OrdersModule,
    CommentsModule,
  ],
  providers: [RefundRequestsService],
})
export class PaymentModule {}

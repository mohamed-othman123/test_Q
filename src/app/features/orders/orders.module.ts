import {NgModule} from '@angular/core';
import {OrdersRoutingModule} from './orders-routing.module';
import {SharedModule} from '@shared/shared.module';
import {OrdersComponent} from './pages/orders/orders.component';
import {AddNewOrderComponent} from './pages/add-new-order/add-new-order.component';
import {
  AdditionalServicesComponent,
  AttachmentsComponent,
  BookingInfoComponent,
  PaymentDetailsComponent,
  BookingSummaryComponent,
} from './components';
import {BookingDetailsComponent} from './components/booking-details/booking-details.component';
import {DialogService} from 'primeng/dynamicdialog';
import {BookingFacadeService} from './services/booking-facade.service';
import {ReceiptPrintComponent} from './components/receipt-print/receipt-print.component';

@NgModule({
  declarations: [
    OrdersComponent,
    AddNewOrderComponent,
    BookingInfoComponent,
    PaymentDetailsComponent,
    AdditionalServicesComponent,
    AttachmentsComponent,
    BookingSummaryComponent,
    BookingDetailsComponent,
    ReceiptPrintComponent,
  ],
  imports: [SharedModule, OrdersRoutingModule],
  providers: [DialogService, BookingFacadeService],
  exports: [BookingDetailsComponent],
})
export class OrdersModule {}

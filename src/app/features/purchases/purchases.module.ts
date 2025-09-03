import {NgModule} from '@angular/core';

import {PurchasesRoutingModule} from './purchases-routing.module';
import {PurchasesComponent} from './pages/purchases/purchases.component';
import {SharedModule} from '@shared/shared.module';
import {PurchaseFormComponent} from './components/purchase-form/purchase-form.component';
import {SelectButtonModule} from 'primeng/selectbutton';
import {PurchasePaymentsComponent} from './components/purchase-payments/purchase-payments.component';
import {PurchasePaymentFormComponent} from './components/purchase-payment-form/purchase-payment-form.component';
import {CalendarCommonModule} from 'angular-calendar';
import {InvoiceAttachmentComponent} from './components/invoice-attachment/invoice-attachment.component';
import {PurchaseDetailsComponent} from './components/purchase-details/purchase-details.component';
import {PurchaseSettlementComponent} from './components/settlement/settlement.component';
import {ExpensesItemsComponent} from './components/expenses-items/expenses-items.component';
import {SupplierProductsServicesComponent} from './components/supplier-products-services/supplier-products-services.component';
import {ViewPurchaseComponent} from './pages/view-purchase/view-purchase.component';
import {AddNewExpenseItemComponent} from './components/add-new-expense-item/add-new-expense-item.component';
import {CommentsModule} from '@shared/components/comments/comments.module';
import { SimplifiedInvoiceItemsComponent } from './components/simplified-invoice-items/simplified-invoice-items.component';

@NgModule({
  declarations: [
    PurchasesComponent,
    PurchaseFormComponent,
    PurchasePaymentsComponent,
    PurchasePaymentFormComponent,
    InvoiceAttachmentComponent,
    PurchaseDetailsComponent,
    PurchaseSettlementComponent,
    ExpensesItemsComponent,
    SupplierProductsServicesComponent,
    ViewPurchaseComponent,
    AddNewExpenseItemComponent,
    SimplifiedInvoiceItemsComponent,
  ],
  imports: [
    SharedModule,
    PurchasesRoutingModule,
    SelectButtonModule,
    CalendarCommonModule,
    CommentsModule,
  ],
})
export class PurchasesModule {}

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PurchasesComponent} from './pages/purchases/purchases.component';
import {PurchaseFormComponent} from './components/purchase-form/purchase-form.component';
import {PurchasePaymentsComponent} from '@purchases/components/purchase-payments/purchase-payments.component';
import {PurchaseSettlementComponent} from './components/settlement/settlement.component';
import {ViewPurchaseComponent} from './pages/view-purchase/view-purchase.component';

const routes: Routes = [
  {
    path: '',
    component: PurchasesComponent,
    data: {title: 'pageTitles.expenses'},
  },
  {
    path: 'add-new-purchase',
    component: PurchaseFormComponent,
    data: {mode: 'add', title: 'pageTitles.addNewExpense'},
  },
  {
    path: 'edit/:id',
    component: PurchaseFormComponent,
    data: {mode: 'edit', title: 'pageTitles.editExpense'},
  },
  {
    path: 'view/:id',
    component: ViewPurchaseComponent,
    data: {title: 'pageTitles.viewExpense'},
  },
  {
    path: 'payments/:id',
    component: PurchasePaymentsComponent,
    data: {title: 'pageTitles.expensePayments'},
  },
  {
    path: 'settlements/:id',
    component: PurchaseSettlementComponent,
    data: {title: 'pageTitles.expenseSettlement'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchasesRoutingModule {}

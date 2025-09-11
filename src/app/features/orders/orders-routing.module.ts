import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OrdersComponent} from './pages/orders/orders.component';
import {AddNewOrderComponent} from './pages/add-new-order/add-new-order.component';
import {ordersResolver} from './resolvers/orders.resolver';
import {canDeactivateOrder} from '@core/guards/can-deactivate-order.guard';
import {BookingCostsComponent} from './pages/booking-costs/booking-costs.component';

const routes: Routes = [
  {
    path: '',
    component: OrdersComponent,
    pathMatch: 'full',
    data: {title: 'pageTitles.orders'},
  },
  {
    path: 'add-new-order',
    component: AddNewOrderComponent,
    resolve: {resolvedData: ordersResolver},
    canDeactivate: [canDeactivateOrder],
    data: {mode: 'add', title: 'pageTitles.addNewOrder'},
  },
  {
    path: 'add-new-order/view',
    component: AddNewOrderComponent,
    resolve: {resolvedData: ordersResolver},
    data: {mode: 'view'},
  },
  {
    path: 'add-new-order/edit',
    component: AddNewOrderComponent,
    resolve: {resolvedData: ordersResolver},
    canDeactivate: [canDeactivateOrder],
    data: {mode: 'edit', title: 'pageTitles.editOrder'},
  },
  {
    path: 'booking-costs/:id',
    component: BookingCostsComponent,
    data: {title: 'pageTitles.bookingCosts'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdersRoutingModule {}

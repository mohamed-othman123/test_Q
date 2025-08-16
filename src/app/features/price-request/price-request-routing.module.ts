import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PriceRequestComponent} from './pages/price-request/price-request.component';
import {PriceRequestDetailsComponent} from './components/price-request-details/price-request-details.component';
import {priceRequestResolver} from './resolvers/price-request.resolver';

const routes: Routes = [
  {
    path: '',
    component: PriceRequestComponent,
    pathMatch: 'full',
    data: {title: 'pageTitles.priceRequest'},
  },

  {
    path: 'view/:id',
    component: PriceRequestDetailsComponent,
    data: {mode: 'view', title: 'pageTitles.viewPriceRequest'},
    resolve: {priceRequest: priceRequestResolver},
  },
  {
    path: 'edit/:id',
    component: PriceRequestDetailsComponent,
    data: {mode: 'edit', title: 'pageTitles.editPriceRequest'},
    resolve: {priceRequest: priceRequestResolver},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PriceRequestRoutingModule {}

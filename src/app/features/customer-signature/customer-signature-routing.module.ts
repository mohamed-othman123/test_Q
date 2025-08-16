import {Route, RouterModule} from '@angular/router';
import {CustomerSignatureComponent} from './pages/customer-signature/customer-signature.component';
import {NgModule} from '@angular/core';

const routes: Route[] = [{path: ':id', component: CustomerSignatureComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerSignatureRoutingModule {}

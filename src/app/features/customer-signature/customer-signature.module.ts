import {NgModule} from '@angular/core';
import {CustomerSignatureComponent} from './pages/customer-signature/customer-signature.component';
import {CustomerSignatureRoutingModule} from './customer-signature-routing.module';
import {SharedModule} from '@shared/shared.module';
import { ContractPreviewComponent } from './components/contract-preview/contract-preview.component';

@NgModule({
  declarations: [CustomerSignatureComponent, ContractPreviewComponent],
  imports: [SharedModule, CustomerSignatureRoutingModule],
})
export class CustomerSignatureModule {}

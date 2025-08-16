import {NgModule} from '@angular/core';

import {PriceRequestRoutingModule} from './price-request-routing.module';
import {PriceRequestComponent} from './pages/price-request/price-request.component';
import {PriceRequestDetailsComponent} from './components/price-request-details/price-request-details.component';
import {SharedModule} from '@shared/shared.module';

@NgModule({
  declarations: [PriceRequestComponent, PriceRequestDetailsComponent],
  imports: [SharedModule, PriceRequestRoutingModule],
})
export class PriceRequestsModule {}

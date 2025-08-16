import {NgModule} from '@angular/core';
import {ClientsRoutingModule} from './clients.router.module';
import {SharedModule} from '@shared/shared.module';
import {ClientsComponent} from './pages/clients/clients.component';
import {ClientDetailsComponent} from '@clients/components/client-details/client-details.component';

@NgModule({
  declarations: [ClientsComponent, ClientDetailsComponent],
  imports: [SharedModule, ClientsRoutingModule],
})
export class ClientsModule {}

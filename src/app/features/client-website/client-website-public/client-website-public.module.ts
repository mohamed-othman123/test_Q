import {NgModule} from '@angular/core';
import {ClientWebsitePublicRoutingModule} from './client-website-public-routing.module';
import {SharedModule} from '@shared/shared.module';

@NgModule({
  declarations: [],
  imports: [SharedModule, ClientWebsitePublicRoutingModule],
})
export class ClientWebsitePublicModule {}

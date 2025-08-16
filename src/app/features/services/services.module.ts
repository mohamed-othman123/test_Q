import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ServicesRoutingModule} from './services-routing.module';
import {SharedModule} from '@shared/shared.module';
import {ServicesComponent} from './pages/services/services.component';
import {AddNewServiceComponent} from './components/add-new-service/add-new-service.component';
@NgModule({
  declarations: [ServicesComponent, AddNewServiceComponent],
  imports: [SharedModule, ServicesRoutingModule],
})
export class ServicesModule {}

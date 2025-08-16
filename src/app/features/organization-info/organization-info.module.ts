import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {OrganizationInfoRoutingModule} from './organization-info-routing.module';
import {SharedModule} from '@shared/shared.module';
import { OrganizationInfoComponent } from './pages/organization-info/organization-info.component';

@NgModule({
  declarations: [
    OrganizationInfoComponent
  ],
  imports: [CommonModule, OrganizationInfoRoutingModule, SharedModule],
})
export class OrganizationInfoModule {}

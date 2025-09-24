import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {OrganizationInfoRoutingModule} from './organization-info-routing.module';
import {SharedModule} from '@shared/shared.module';
import { OrganizationInfoComponent } from './pages/organization-info/organization-info.component';
import { DialogModule } from 'primeng/dialog';
import { ZatcaOTPComponent } from './components/zatca-otp.component';
import { NgOtpInputModule } from 'ng-otp-input';

@NgModule({
  declarations: [
    OrganizationInfoComponent,
    ZatcaOTPComponent
  ],
  imports: [CommonModule, OrganizationInfoRoutingModule, SharedModule, DialogModule, NgOtpInputModule],
})
export class OrganizationInfoModule {}

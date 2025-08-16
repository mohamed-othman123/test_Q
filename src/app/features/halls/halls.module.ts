import {NgModule} from '@angular/core';
import {HallsComponent} from './pages/halls/halls.component';
import {SharedModule} from '@shared/shared.module';
import {HallsRoutingModule} from './halls-routing.module';
import {HallDrawerComponent} from './components/add-new-hall/hall-drawer.component';
import {HallFormComponent} from './components/hall-form/hall-form.component';
import {EditHallComponent} from './pages/edit-hall/edit-hall.component';
import {HallDetailsComponent} from '@halls/components/hall-details/hall-details.component';
import {HallSectionsComponent} from '@halls/components/hall-sections/hall-sections.component';
import {HallContractComponent} from '@halls/components/hall-contract/hall-contract.component';
import {HallPricingComponent} from '@halls/components/hall-pricing/hall-pricing.component';
import {HallTeamComponent} from '@halls/components/hall-team/hall-team.component';
import {ConfirmationDialogComponent} from './components/confirmation-dialog/confirmation-dialog.component';
import {ContractsListComponent} from './components/hall-contract/components/contracts-list/contracts-list.component';
import {EditContractComponent} from './components/hall-contract/components/edit-contract/edit-contract.component';
import {ContractAttachmentsComponent} from './components/hall-contract/components/contract-attachments/contract-attachments.component';
import {HallSignatureComponent} from './components/hall-signature/hall-signature.component';

@NgModule({
  declarations: [
    HallsComponent,
    HallDrawerComponent,
    EditHallComponent,
    HallFormComponent,
    HallDetailsComponent,
    HallSectionsComponent,
    HallContractComponent,
    HallPricingComponent,
    HallTeamComponent,
    ConfirmationDialogComponent,
    ContractsListComponent,
    EditContractComponent,
    ContractAttachmentsComponent,
    HallSignatureComponent,
  ],
  imports: [SharedModule, HallsRoutingModule],
})
export class HallsModule {}

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ClientWebsiteAdminRoutingModule} from './client-website-admin-routing.module';
import {SharedModule} from '@shared/shared.module';
import {LandingPageComponent} from './pages/landing-page/landing-page.component';
import {BasicInformationComponent} from './components/basic-information/basic-information.component';
import {HallMediaComponent} from './components/hall-media/hall-media.component';

import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {HallFeaturesComponent} from './components/hall-features/hall-features.component';
import {HallServicesComponent} from './components/hall-services/hall-services.component';
import {PopularQuestionsComponent} from './components/popular-questions/popular-questions.component';
import {SocialMediaComponent} from './components/social-media/social-media.component';
import {LocationComponent} from './components/location/location.component';
import {EmptyDataComponent} from './components/empty-data/empty-data.component';
import {HallDetailsComponent} from './components/hall-details/hall-details.component';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import { HallClientsComponent } from './components/hall-clients/hall-clients.component';
import { AddSectionComponent } from './components/add-section/add-section.component';
import {InputTextareaModule} from 'primeng/inputtextarea';

@NgModule({
  declarations: [
    LandingPageComponent,
    BasicInformationComponent,
    HallMediaComponent,
    HallFeaturesComponent,
    HallServicesComponent,
    PopularQuestionsComponent,
    SocialMediaComponent,
    LocationComponent,
    EmptyDataComponent,
    HallDetailsComponent,
    HallClientsComponent,
    AddSectionComponent,
  ],
  imports: [
    SharedModule,
    FormsModule,
    DragDropModule,
    ClientWebsiteAdminRoutingModule,
    ProgressSpinnerModule,
    FaIconComponent,
    InputTextareaModule,
  ],
})
export class ClientWebsiteAdminModule {}

import {NgModule} from '@angular/core';
import {AdminLandingPageRoutingModule} from './admin-landing-page-routing.module';
import {SharedModule} from '@shared/shared.module';
import {LandingPageComponent} from './pages/landing-page/landing-page.component';
import {BasicInformationComponent} from './components/basic-information/basic-information.component';
import {HallMediaComponent} from './components/hall-media/hall-media.component';
import {CdkDrag, CdkDragHandle, CdkDropList} from '@angular/cdk/drag-drop';
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
    AddSectionComponent
  ],
  imports: [
    SharedModule,
    AdminLandingPageRoutingModule,
    CdkDropList,
    CdkDrag,
    ProgressSpinnerModule,
    CdkDragHandle,
    FaIconComponent,
  ],
})
export class AdminLandingPageModule {}

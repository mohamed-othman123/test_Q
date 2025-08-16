import {NgModule} from '@angular/core';
import {SharedModule} from '@shared/shared.module';
import {ProfileRoutingModule} from './profile-routing.module';
import {ProfileComponent} from './pages/profile.component';
import {PersonalDetailsComponent} from './components/personal-details/personal-details.component';
import {SubscriptionsComponent} from '@profile/components/subscriptions/subscriptions.component';

@NgModule({
  declarations: [
    ProfileComponent,
    PersonalDetailsComponent,
    SubscriptionsComponent,
  ],
  imports: [SharedModule, ProfileRoutingModule],
})
export class ProfileModule {}

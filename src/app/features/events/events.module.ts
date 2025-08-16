import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EventsComponent} from './pages/events/events.component';
import {EventsRoutingModule} from './events-routing.module';
import {SharedModule} from '@shared/shared.module';
import {FormsModule} from '@angular/forms';
import {AddNewEventComponent} from './components/add-new-event/add-new-event.component';

@NgModule({
  declarations: [EventsComponent, AddNewEventComponent],
  imports: [EventsRoutingModule, SharedModule, FormsModule],
})
export class EventsModule {}

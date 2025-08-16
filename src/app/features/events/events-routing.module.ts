import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EventsComponent} from './pages/events/events.component';

const routes: Routes = [
  {
    path: '',
    component: EventsComponent,
    pathMatch: 'full',
    data: {title: 'pageTitles.events'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsRoutingModule {}

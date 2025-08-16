import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CalendarComponent} from '@calendar/pages/calendar.component';

const routes: Routes = [
  {
    path: '',
    component: CalendarComponent,
    pathMatch: 'full',
    data: {title: 'pageTitles.calendar'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarRoutingModule {}

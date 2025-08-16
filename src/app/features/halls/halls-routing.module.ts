import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HallsComponent} from './pages/halls/halls.component';
import {EditHallComponent} from './pages/edit-hall/edit-hall.component';
import {PendingChangesGuard} from '@core/guards/pending-changes.guard';

const routes: Routes = [
  {
    path: '',
    component: HallsComponent,
    pathMatch: 'full',
    data: {title: 'pageTitles.halls'},
  },
  {
    path: 'edit/:id',
    component: EditHallComponent,
    canDeactivate: [PendingChangesGuard],
    data: {title: 'pageTitles.editHall'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [PendingChangesGuard],
})
export class HallsRoutingModule {}

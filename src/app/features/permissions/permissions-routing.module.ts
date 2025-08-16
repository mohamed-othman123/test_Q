import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PermissionsComponent} from './pages/permissions/permissions.component';
import {PermissionDetailsComponent} from '@permissions/components/permission-details/permission-details.component';

const routes: Routes = [
  {
    path: '',
    component: PermissionsComponent,
    pathMatch: 'full',
    data: {title: 'pageTitles.jobs'},
  },
  {
    path: 'add',
    component: PermissionDetailsComponent,
    data: {mode: 'add', title: 'pageTitles.addNewJob'},
  },
  {
    path: 'edit/:id',
    component: PermissionDetailsComponent,
    data: {mode: 'edit', title: 'pageTitles.editJob'},
  },
  {
    path: 'view/:id',
    component: PermissionDetailsComponent,
    data: {mode: 'view', title: 'pageTitles.viewJob'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PermissionsRoutingModule {}

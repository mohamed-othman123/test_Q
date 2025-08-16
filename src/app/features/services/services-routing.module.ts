import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ServicesComponent} from './pages/services/services.component';
import {AddNewServiceComponent} from './components/add-new-service/add-new-service.component';
import {ServicesResolver} from './resolvers/services.resolver';

const routes: Routes = [
  {
    path: '',
    component: ServicesComponent,
    pathMatch: 'full',
    data: {title: 'pageTitles.services'},
  },
  {
    path: 'add',
    component: AddNewServiceComponent,
    data: {mode: 'add', title: 'pageTitles.addNewService'},
  },
  {
    path: 'edit/:id',
    component: AddNewServiceComponent,
    data: {mode: 'edit', title: 'pageTitles.editService'},
    resolve: {service: ServicesResolver},
  },
  {
    path: 'view/:id',
    component: AddNewServiceComponent,
    data: {mode: 'view', title: 'pageTitles.viewService'},
    resolve: {service: ServicesResolver},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServicesRoutingModule {}

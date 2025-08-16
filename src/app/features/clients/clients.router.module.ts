import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ClientsComponent} from './pages/clients/clients.component';
import {ClientDetailsComponent} from '@clients/components/client-details/client-details.component';

const routes: Routes = [
  {
    path: '',
    component: ClientsComponent,
    pathMatch: 'full',
    data: {title: 'pageTitles.clients'},
  },
  {
    path: 'details/:id',
    component: ClientDetailsComponent,
    data: {title: 'pageTitles.viewClient'},
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientsRoutingModule {}

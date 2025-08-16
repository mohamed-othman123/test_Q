import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EmployeesComponent} from './pages/employees/employees.component';
import {employeeResolver} from './resolvers/employee.resolver';

const routes: Routes = [
  {
    path: '',
    component: EmployeesComponent,
    pathMatch: 'full',
    resolve: {
      data: employeeResolver,
    },
    data: {title: 'pageTitles.employees'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeesRoutingModule {}

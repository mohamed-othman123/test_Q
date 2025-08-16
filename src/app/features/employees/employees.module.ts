import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EmployeesRoutingModule} from './employees-routing.module';
import {SharedModule} from '@shared/shared.module';
import {EmployeesComponent} from './pages/employees/employees.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AddNewEmployeeComponent} from './components/add-new-employee/add-new-employee.component';

@NgModule({
  declarations: [EmployeesComponent, AddNewEmployeeComponent],
  imports: [
    SharedModule,
    EmployeesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class EmployeesModule {}

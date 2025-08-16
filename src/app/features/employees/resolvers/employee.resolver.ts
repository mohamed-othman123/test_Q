import {inject} from '@angular/core';
import {ResolveFn} from '@angular/router';
import {Item, Role} from '@core/models';
import {EmployeesService} from '@employees/services/employees.service';
import {combineLatest} from 'rxjs';

export const employeeResolver: ResolveFn<{
  roles: Role[];
  employeeStatuses: Item[];
}> = (route, state) => {
  const employeeService = inject(EmployeesService);
  return combineLatest({
    roles: employeeService.getRoles(),
    employeeStatuses: employeeService.getEmployeeStatuses(),
  });
};

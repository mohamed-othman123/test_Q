import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Filter} from '@core/interfaces';
import {DataTableFilter, FormMode, Item, TableData} from '@core/models';
import {FilterService, LanguageService} from '@core/services';
import {DrawerService} from '@core/services/drawer.service';
import {Moderator} from '@employees/models/employee.model';
import {EmployeesService} from '@employees/services/employees.service';
import {TranslateService} from '@ngx-translate/core';
import {HallsService} from '@halls/services/halls.service';
import {stringifyDate} from '@shared/components/date-picker/helper/date-helper';
import {Table} from 'primeng/table';
import moment from 'moment';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss',
  providers: [EmployeesService],
  standalone: false,
})
export class EmployeesComponent extends Filter implements OnInit {
  @ViewChild('dt2')
  override dataTable!: Table;

  Moderators!: Moderator[] | any;
  selectedItems!: Moderator[];
  mode: FormMode = 'add';
  employee: null | Moderator = null;
  employeeStatuses: Item[] = [];

  protected override filterConfig: {[key: string]: unknown} = {
    name: [null],
    role: [null],
    email: [null],
    phone: [null],
    creationDate: [null],
    active: [null],
  };

  constructor(
    private employeesService: EmployeesService,
    protected override filterService: FilterService,
    public drawerService: DrawerService,
    private hallsService: HallsService,
    route: ActivatedRoute,
    public translate: TranslateService,
    public lang: LanguageService,
  ) {
    super(filterService);
    this.employeeStatuses = route.snapshot.data['data'].employeeStatuses;
  }

  override ngOnInit() {
    super.ngOnInit();

    // this.hallsService.currentHall$.subscribe((hall) => {
    //   this.loadDataTable(this.filters);
    // });
  }

  protected override loadDataTable(filters: DataTableFilter) {
    if (!this.hallsService.getCurrentHall()) {
      this.Moderators = [];
      this.totalRecords = 0;
      return;
    }

    const {creationDate, ...formattedFilters} = {...filters};

    if (creationDate) {
      const date = stringifyDate(creationDate);

      if (!moment(date).isValid()) return;
      formattedFilters['creationDate'] = date;
    }

    this.employeesService
      .getListModerators({
        ...formattedFilters,
      })
      .subscribe((users: TableData<Moderator>) => {
        this.Moderators = users?.items;
        this.totalRecords = users?.totalItems;
      });
  }

  addNewModerator() {
    const currentHall = this.hallsService.getCurrentHall();
    if (!currentHall) return;

    this.drawerService.open({
      mode: 'add',
      title: 'employees.addNewEmployee',
      data: {hallId: currentHall.id},
    });
  }

  editModerator(event: Event, employee: Moderator) {
    event.stopPropagation();
    const currentHall = this.hallsService.getCurrentHall();
    if (!currentHall) return;

    this.drawerService.open({
      mode: 'edit',
      title: 'employees.updateEmployee',
      data: {...employee, hallId: currentHall.id},
    });
  }

  viewDetails(employee: Moderator) {
    this.drawerService.open({
      mode: 'view',
      title: 'employees.viewEmployee',
      data: employee,
    });
  }

  deleteEmployee(employee: Moderator) {
    this.confirmDeleteEmployee(employee);
  }

  confirmDeleteEmployee(emp: Moderator) {
    this.employeesService.deleteEmployee(emp?.id).subscribe(() => {
      this.refreshDataTable();
    });
  }

  refreshDataTable(): void {
    this.loadDataTable(this.filters);
  }
}

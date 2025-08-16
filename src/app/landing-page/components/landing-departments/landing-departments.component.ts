
import {Component, Input, OnInit} from '@angular/core';
import {IDepartment} from '@core/interfaces/landing-pages/i-department';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'app-landing-departments',
    imports: [TranslateModule],
    templateUrl: './landing-departments.component.html',
    styleUrl: './landing-departments.component.scss'
})
export class LandingDepartmentsComponent implements OnInit {
  @Input() hallDepartmentsData: any;
  hallDepartments: IDepartment[] = [];
  ngOnInit(): void {
    this.hallDepartments = this.hallDepartmentsData;
  }
}

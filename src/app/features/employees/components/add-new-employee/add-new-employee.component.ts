import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Role} from '@core/models/role.model';
import {requireOneOf, validateDoubleName} from '@core/validators';
import {EmployeesService} from '@employees/services/employees.service';
import {FormMode, Item} from '@core/models';
import {TranslateService} from '@ngx-translate/core';
import {Moderator} from '@employees/models/employee.model';
import {HallsService} from '@halls/services/halls.service';
import {DrawerService} from '@core/services/drawer.service';
import {Subscription} from 'rxjs';
import {ParsedPhoneNumber} from '@core/models/ParsedPhoneNumber';
import {parsePhoneNumberWithError} from 'libphonenumber-js';
import {noDoubleSpaceValidator} from '@core/validators/no-double-space.validator';
import {Hall} from '@halls/models/halls.model';

@Component({
    selector: 'app-add-new-employee',
    templateUrl: './add-new-employee.component.html',
    styleUrl: './add-new-employee.component.scss',
    standalone: false
})
export class AddNewEmployeeComponent implements OnInit, OnDestroy {
  mode: FormMode = 'add';
  subscription = new Subscription();
  moderator: Moderator | null = null;
  @Output() refreshDataTable = new EventEmitter();

  roles: Role[];
  employeeStatuses: Item[];

  types: Item[] = [
    {value: 'system manager', label: {ar: 'مدير النظام', en: 'System Manager'}},
    {value: 'employee', label: {ar: 'موظف', en: 'Employee'}},
  ];
  permissionTypes: Item[] = [
    {
      value: 'general permission',
      label: {ar: 'صلاحية شاملة', en: 'General Permission'},
    },
    {
      value: 'special permission',
      label: {ar: 'صلاحية خاصة', en: 'Special Permission'},
    },
  ];

  isEmployee = true;

  halls: Hall[];

  form = this.fb.group(
    {
      name: ['', [validateDoubleName(), noDoubleSpaceValidator()]],
      email: ['', [Validators.required, Validators.email]],
      phone: [null as string | null, [Validators.required]],
      type: [null as Item | null, Validators.required],
      role: [null as Role | null, [Validators.required]],
      permissionType: [null as Item | null, Validators.required],
      halls: this.fb.control<null | Hall[]>(null, Validators.required),
      active: [null as boolean | null],
    },
    {
      validators: requireOneOf(['name']),
    },
  );

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeesService,
    route: ActivatedRoute,
    private hallsService: HallsService,
    public translate: TranslateService,
    public drawerService: DrawerService,
  ) {
    this.roles = route.snapshot.data['data'].roles.items;
    this.employeeStatuses = route.snapshot.data['data'].employeeStatuses;

    this.halls = this.hallsService.halls;
  }

  ngOnInit(): void {
    const sub = this.drawerService.drawerState$.subscribe((state) => {
      if (state.visible) {
        this.mode = state.mode;
        if (state.data) {
          this.moderator = {...(state.data as Moderator)};
          this.updateFormWithModeratorData(this.moderator);
        } else {
          this.moderator = null;
          this.form.reset();
        }
      }
    });
    this.subscription.add(sub);
    this.typesListener();
  }

  get formControls() {
    return this.form.controls;
  }

  typesListener() {
    const sub = this.formControls.type.valueChanges.subscribe(
      (val: Item | null) => {
        if (!val) return;

        if (val.value === 'system manager') {
          this.formControls.role.removeValidators(Validators.required);
          this.formControls.permissionType.disable();
          this.formControls.halls.disable();

          this.isEmployee = false;
        } else {
          this.formControls.role.addValidators(Validators.required);
          this.formControls.permissionType.enable();
          this.formControls.halls.enable();
          this.isEmployee = true;
        }
        this.formControls.role.updateValueAndValidity();
      },
    );
    this.subscription.add(sub);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.preparePayload();

    const submissionApi =
      this.mode === 'add'
        ? this.employeeService.addModerator(payload)
        : this.employeeService.updateModerator(this.moderator?.id!, payload);

    submissionApi.subscribe({
      next: () => {
        this.isEmployee = true;
        this.drawerService.close();
        this.refreshDataTable.emit();
      },
    });
  }

  private preparePayload() {
    const value = this.form.value;
    const phone = value?.phone as unknown as ParsedPhoneNumber;

    const payload: any = {
      name: value.name,
      email: value.email,
      phone: phone.internationalNumber,
      type: value.type?.value,
      role: value.role?.id || null,
      permissionType: value.permissionType?.value || null,
      halls: value.halls?.map((ele) => ({id: ele?.id})) || null,
    };
    if (this.mode === 'edit') {
      payload.active = value.active ?? null;
    }
    return payload;
  }

  private updateFormWithModeratorData(moderator: Moderator): void {
    const matchingRole =
      this.roles.find((role) => role.id === moderator.role?.id) || null;

    const type = this.types.find((type) => type.value === moderator.type);
    const permissionType = this.permissionTypes.find(
      (perm) => perm.value === moderator.permissionType,
    );

    this.form.patchValue({
      name: moderator.name,
      role: matchingRole,
      email: moderator.email,
      phone: this.extractNationalNumber(moderator.phone || ''),
      active: moderator.active,
      type: type,
      permissionType: permissionType,
      halls: moderator.halls,
    });

    this.formControls.phone.markAsPristine();
    this.formControls.phone.markAsUntouched();

    this.form.updateValueAndValidity();
  }

  private extractNationalNumber(phone: string): string {
    if (!phone) {
      return '';
    }
    try {
      const parsedNumber = parsePhoneNumberWithError(phone);
      return parsedNumber.nationalNumber;
    } catch (error) {
      return phone;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

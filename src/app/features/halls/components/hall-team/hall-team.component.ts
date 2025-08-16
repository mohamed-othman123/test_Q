import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Hall, HallTeamMember} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {finalize} from 'rxjs/operators';
import {merge, Subject, Subscription} from 'rxjs';
import {takeUntil, debounceTime} from 'rxjs/operators';
import {NotificationService} from '@core/services';
import {noDoubleSpaceValidator, validateDoubleName} from '@core/validators';
import {FormStateService} from '@halls/services/form-state.service';
import {EmployeesService} from '@employees/services/employees.service';
import {Moderator} from '@employees/models/employee.model';
import {TranslateService} from '@ngx-translate/core';
import {HallTeamMembersService} from '@halls/services/hall-team-members.service';
import {extractNationalPhoneNumber} from '@core/utils';

export interface TeamMemberType {
  value: string;
  label: string;
}

export interface ScheduleDayOption {
  value: number;
  label: string;
}

export interface ScheduleShortcut {
  label: string;
  days: number;
  icon: string;
}

@Component({
  selector: 'app-hall-team',
  templateUrl: './hall-team.component.html',
  styleUrls: ['./hall-team.component.scss'],
  standalone: false,
})
export class HallTeamComponent implements OnInit, OnDestroy {
  @Input() hallId!: string;
  @Input() hallData!: Hall;
  @Output() teamUpdated = new EventEmitter<Hall>();

  teamMembers!: HallTeamMember[];
  isLoading = true;
  memberForm!: FormGroup;
  showMemberForm: boolean = false;
  editingMemberIndex: number = -1;
  isSubmitting: boolean = false;
  formInitialized: boolean = false;
  viewMode: boolean = false;

  sendingTime = new FormControl<string | null>(null);
  scheduleDays = new FormControl<number>(1, [
    Validators.required,
    Validators.min(1),
    Validators.max(7),
  ]);

  memberTypes: TeamMemberType[] = [];
  selectedMemberType: string = 'thirdParty';
  employees: Moderator[] = [];
  isLoadingEmployees: boolean = false;

  scheduleDaysOptions: ScheduleDayOption[] = [];

  scheduleShortcuts: ScheduleShortcut[] = [];

  private destroy$ = new Subject<void>();
  private _typeSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private hallsService: HallsService,
    private notificationService: NotificationService,
    private formStateService: FormStateService,
    private employeesService: EmployeesService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private hallTeamMembersService: HallTeamMembersService,
  ) {
    this.updateMemberTypes();
    this.initializeScheduleOptions();

    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateMemberTypes();
        this.initializeScheduleOptions();
      });
  }

  private updateMemberTypes(): void {
    this.memberTypes = [
      {
        value: 'employee',
        label: this.translateService.instant('halls.employeeType'),
      },
      {
        value: 'thirdParty',
        label: this.translateService.instant('halls.thirdPartyType'),
      },
    ];
  }

  private initializeScheduleOptions(): void {
    this.scheduleDaysOptions = Array.from({length: 7}, (_, i) => ({
      value: i + 1,
      label: this.translateService.instant('halls.scheduleDaysOption', {
        days: i + 1,
      }),
    }));

    this.scheduleShortcuts = [
      {
        label: this.translateService.instant('halls.todayOnly'),
        days: 1,
        icon: 'pi-calendar',
      },
      {
        label: this.translateService.instant('halls.todayPlusTomorrow'),
        days: 2,
        icon: 'pi-calendar-plus',
      },
      {
        label: this.translateService.instant('halls.threeDaysAhead'),
        days: 3,
        icon: 'pi-calendar-times',
      },
      {
        label: this.translateService.instant('halls.sevenDaysAhead'),
        days: 7,
        icon: 'pi-calendar',
      },
    ];
  }

  ngOnInit(): void {
    this.getTeamMembers();
    this.initializeForms();
    this.loadEmployees();

    this.sendingTime.setValue(this.hallData?.sendingTime || null);
    this.scheduleDays.setValue(this.hallData?.scheduleDays || 1);

    merge(this.sendingTime.valueChanges, this.scheduleDays.valueChanges)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.formStateService.markTabAsDirty(5);
      });
  }

  getTeamMembers() {
    this.hallTeamMembersService
      .getTeamMembers(this.hallId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.teamMembers = response.items || [];
          this.isLoading = false;
        },
      });
  }

  private loadEmployees(): void {
    this.isLoadingEmployees = true;

    const filters = {
      hallId: this.hallId,
      active: true,
    };

    this.employeesService
      .getListModerators(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoadingEmployees = false)),
      )
      .subscribe({
        next: (response) => {
          if (response && response.items) {
            this.employees = response.items;
          }
        },
      });
  }

  private initializeForms(): void {
    this.memberForm = this.fb.group({
      id: [null],
      memberType: ['thirdParty', Validators.required],
      name: [
        '',
        [Validators.required, validateDoubleName(), noDoubleSpaceValidator()],
      ],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      occupation: [''],
      moderatorId: [null],
    });

    this.initializeTypeSubscription();

    this.formInitialized = true;
  }

  private initializeTypeSubscription(): void {
    const typeControl = this.memberForm.get('memberType');

    if (this._typeSubscription) {
      this._typeSubscription.unsubscribe();
      this._typeSubscription = null;
    }

    if (typeControl) {
      this._typeSubscription = typeControl.valueChanges
        .pipe(debounceTime(50), takeUntil(this.destroy$))
        .subscribe((value) => {
          this.selectedMemberType = value;
          this.updateFormValidation();
          this.cdr.detectChanges();
        });
    }
  }

  private getRoleName(employee: any): string {
    if (!employee.role) return 'N/A';

    const currentLang = this.translateService.currentLang || 'en';

    if (
      currentLang === 'ar' &&
      employee.role.name_ar &&
      employee.role.name_ar.trim() !== ''
    ) {
      return employee.role.name_ar;
    }

    return employee.role.name || 'N/A';
  }

  selectEmployeeAndUpdateForm(event: any): void {
    const employeeId = event?.value || event;

    if (!employeeId) {
      return;
    }

    const selectedEmployee = this.employees.find(
      (emp) => emp.id === employeeId,
    );

    if (selectedEmployee) {
      if (this._typeSubscription) {
        this._typeSubscription.unsubscribe();
        this._typeSubscription = null;
      }

      try {
        const roleName = this.getRoleName(selectedEmployee);

        this.memberForm.patchValue(
          {
            memberType: 'employee',
            moderatorId: selectedEmployee.id,
            name: selectedEmployee.name || 'N/A',
            email: selectedEmployee.email || 'N/A',
            phone: selectedEmployee.phone || 'N/A',
            occupation: roleName,
          },
          {emitEvent: false, onlySelf: true},
        );

        this.selectedMemberType = 'employee';
        this.updateFormValidation();
        this.cdr.detectChanges();
      } finally {
        this.initializeTypeSubscription();
      }
    }
  }

  employeeSelected(event: any): void {
    if (event && event.value) {
      this.selectEmployeeAndUpdateForm(event.value);
    }
  }

  private updateFormValidation(): void {
    const emailControl = this.memberForm.get('email');
    const phoneControl = this.memberForm.get('phone');
    const nameControl = this.memberForm.get('name');
    const employeeIdControl = this.memberForm.get('employeeId');

    if (this.selectedMemberType === 'employee') {
      employeeIdControl?.setValidators([Validators.required]);
      nameControl?.clearValidators();
      emailControl?.clearValidators();
      phoneControl?.clearValidators();
    } else {
      employeeIdControl?.clearValidators();
      nameControl?.setValidators([
        Validators.required,
        validateDoubleName(),
        noDoubleSpaceValidator(),
      ]);
      emailControl?.setValidators([Validators.required, Validators.email]);
      phoneControl?.setValidators([Validators.required]);
    }

    employeeIdControl?.updateValueAndValidity({emitEvent: false});
    nameControl?.updateValueAndValidity({emitEvent: false});
    emailControl?.updateValueAndValidity({emitEvent: false});
    phoneControl?.updateValueAndValidity({emitEvent: false});
  }

  addNewMember(): void {
    this.editingMemberIndex = -1;

    if (this._typeSubscription) {
      this._typeSubscription.unsubscribe();
      this._typeSubscription = null;
    }

    try {
      this.memberForm.patchValue(
        {
          memberType: 'thirdParty',
          id: null,
          name: '',
          email: '',
          phone: '',
          occupation: '',
          moderatorId: null,
        },
        {emitEvent: false, onlySelf: true},
      );

      this.selectedMemberType = 'thirdParty';
      this.updateFormValidation();
      this.showMemberForm = true;
    } finally {
      this.initializeTypeSubscription();
    }
    this.formStateService.markTabAsDirty(5);
  }

  editMember(index: number): void {
    const member = this.teamMembers?.[index];

    if (member.type === 'employee') {
      return;
    }

    this.editingMemberIndex = index;

    if (this._typeSubscription) {
      this._typeSubscription.unsubscribe();
      this._typeSubscription = null;
    }

    try {
      this.memberForm.patchValue(
        {
          id: member.id,
          memberType: member.memberType,
          name: member.name,
          email: member.email,
          phone: extractNationalPhoneNumber(member.phone || ''),
          occupation: member.occupation,
          moderatorId: member.employeeId,
        },
        {emitEvent: false, onlySelf: true},
      );

      this.memberForm.get('memberType')?.disable();

      // this.selectedMemberType = member.memberType!;
      this.updateFormValidation();
      this.showMemberForm = true;
    } finally {
      this.initializeTypeSubscription();
    }
    this.formStateService.markTabAsDirty(5);
  }

  saveMember(): void {
    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      return;
    }

    const memberData = this.prepareMemberData();

    const request$ =
      this.editingMemberIndex === -1
        ? this.hallTeamMembersService.createTeamMember(this.hallId, memberData)
        : this.hallTeamMembersService.updateTeamMember(this.hallId, memberData);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.getTeamMembers();
        this.cancelMemberEdit();
      },
    });
  }

  prepareMemberData() {
    const memberData = this.memberForm.getRawValue();

    return {
      id: memberData.id || null,
      memberType: memberData.memberType,
      name: memberData.name || '',
      email: memberData.email || '',
      phone: memberData.phone.internationalNumber,
      moderatorId: memberData.moderatorId || null,
    };
  }

  cancelMemberEdit(): void {
    this.showMemberForm = false;
    this.editingMemberIndex = -1;

    if (this._typeSubscription) {
      this._typeSubscription.unsubscribe();
      this._typeSubscription = null;
    }

    try {
      this.memberForm.patchValue(
        {
          id: null,
          memberType: 'thirdParty',
          name: '',
          email: '',
          phone: '',
          occupation: '',
          moderatorId: null,
        },
        {emitEvent: false, onlySelf: true},
      );

      this.selectedMemberType = 'thirdParty';
      this.memberForm.get('memberType')?.enable();
      this.updateFormValidation();
    } finally {
      this.initializeTypeSubscription();
    }
    this.formStateService.markTabAsClean(5);
  }

  removeMember(index: number): void {
    this.hallTeamMembersService
      .deleteTeamMember(this.hallId, this.teamMembers[index].id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.getTeamMembers();
        },
      });
  }

  getMemberPhoneForEdit(): string {
    if (this.editingMemberIndex === -1) return '';

    return this.teamMembers[this.editingMemberIndex]?.phone || '';
  }

  getMemberType(index: number): string {
    const member = this.teamMembers[index];
    return member ? member.memberType! : '';
  }

  isMemberEmployee(index: number) {
    return this.getMemberType(index) === 'employee';
  }

  isMemberThirdParty(index: number) {
    return this.getMemberType(index) === 'thirdParty';
  }

  getTypeLabel(type: string): string {
    if (!type) return '';
    return type === 'employee'
      ? this.translateService.instant('halls.employeeType')
      : this.translateService.instant('halls.thirdPartyType');
  }

  selectScheduleShortcut(shortcut: ScheduleShortcut): void {
    this.scheduleDays.setValue(shortcut.days);
    this.saveSendingTimeAndSchedule();
  }

  saveSendingTimeAndSchedule(): void {
    if (this.scheduleDays.invalid) {
      this.scheduleDays.markAsTouched();

      if (this.scheduleDays.hasError('max')) {
        this.notificationService.showError('halls.scheduleMaxDaysError');
        return;
      }

      if (
        this.scheduleDays.hasError('min') ||
        this.scheduleDays.hasError('required')
      ) {
        this.notificationService.showError('halls.scheduleMinDaysError');
        return;
      }
    }

    const formData = new FormData();

    if (this.sendingTime.value) {
      formData.append('sendingTime', this.sendingTime.value);
    }

    formData.append('scheduleDays', this.scheduleDays.value?.toString() || '1');

    this.isSubmitting = true;

    this.hallsService
      .updateHall(+this.hallId, formData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: (updatedHall) => {
          this.hallData = updatedHall;
          this.teamUpdated.emit(updatedHall);
          this.formStateService.markTabAsClean(5);
        },
        error: () => {
          this.notificationService.showError('halls.scheduleUpdateError');
        },
      });
  }

  ngOnDestroy(): void {
    if (this._typeSubscription) {
      this._typeSubscription.unsubscribe();
      this._typeSubscription = null;
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}

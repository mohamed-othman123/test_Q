import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {FormMode} from '@core/models';
import {DrawerService} from '@core/services/drawer.service';
import {Hall} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {Subscription} from 'rxjs';
import {noDoubleSpaceValidator, requireOneOf} from '@core/validators';

@Component({
    selector: 'app-hall-drawer',
    templateUrl: './hall-drawer.component.html',
    styleUrls: ['./hall-drawer.component.scss'],
    standalone: false
})
export class HallDrawerComponent implements OnInit, OnDestroy {
  confirmAddNewHall = false;

  mode: FormMode = 'add';
  hall: Hall | null = null;
  hallsCount = this.hallsService.halls.length;

  @Output() refreshDataTable = new EventEmitter();
  subs = new Subscription();

  form = this.fb.group(
    {
      name: ['', noDoubleSpaceValidator()],
      name_ar: ['', noDoubleSpaceValidator()],
      description: [''],
    },
    {
      validators: requireOneOf(['name', 'name_ar']),
    },
  );

  constructor(
    private fb: FormBuilder,
    private hallService: HallsService,
    private drawerService: DrawerService,
    private hallsService: HallsService,
  ) {}

  get formControls() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const sub = this.drawerService.drawerState$.subscribe((state) => {
      this.checkIfItTheFirstHall();

      if (state.visible) {
        this.mode = state.mode;
        this.hall = state.data as Hall;
        if (this.hall) {
          this.form.patchValue({
            name: this.hall.name,
            name_ar: this.hall.name_ar,
            description: this.hall.description,
          });
        } else {
          this.form.reset();
        }
      } else {
        this.cleanup();
      }
    });
    this.subs.add(sub);

    // subscribe to count the current halls
    this.subs.add(
      this.hallsService.halls$.subscribe((halls) => {
        this.hallsCount = halls.length;
      }),
    );
  }

  checkIfItTheFirstHall() {
    if (this.hallsCount > 0) {
      this.confirmAddNewHall = false;
    } else {
      this.confirmAddNewHall = true;
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.form.value.name,
      name_ar: this.form.value.name_ar,
      description: this.form.value.description,
    };

    const submissionApi = this.hallService.addHall(payload);

    submissionApi.subscribe({
      next: (hall) => {
        this.hallService.setCurrentHall(hall);
        this.drawerService.close();
        this.refreshDataTable.emit();
      },
    });
  }

  cleanup() {
    this.hall = null;
    this.form.reset();
  }
  rejected() {
    this.drawerService.close();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

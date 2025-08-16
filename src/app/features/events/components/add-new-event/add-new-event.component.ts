import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Event} from '@events/models/events.model';
import {EventsService} from '@events/services/events.service';
import {HallsService} from '@halls/services/halls.service';
import {Hall} from '@halls/models/halls.model';
import {DrawerService} from '@core/services/drawer.service';
import {Subscription} from 'rxjs';
import {FormMode} from '@core/models';
import {noDoubleSpaceValidator, requireOneOf} from '@core/validators';

@Component({
    selector: 'app-add-new-event',
    templateUrl: './add-new-event.component.html',
    styleUrl: './add-new-event.component.scss',
    standalone: false
})
export class AddNewEventComponent implements OnInit, OnDestroy {
  @Input() headerTitle: string = '';
  @Output() refreshDataTable = new EventEmitter();

  event: Event | null = null;
  currentHall: Hall | null = null;
  subs = new Subscription();
  mode: FormMode = 'add';

  form = this.fb.group(
    {
      name: ['', [noDoubleSpaceValidator()]],
      name_ar: ['', [noDoubleSpaceValidator()]],
      description: ['', [noDoubleSpaceValidator()]],
    },
    {
      validators: requireOneOf(['name', 'name_ar']),
    },
  );

  constructor(
    private fb: FormBuilder,
    private eventsService: EventsService,
    private hallsService: HallsService,
    public drawerService: DrawerService,
  ) {}

  ngOnInit(): void {
    const drawerSub = this.drawerService.drawerState$.subscribe((state) => {
      if (state.visible) {
        this.mode = state.mode;
        this.event = state.data as Event;
        if (this.event) {
          this.form.patchValue(this.event);
        }
      } else {
        this.cleanup();
      }
    });
    this.subs.add(drawerSub);

    const hallSub = this.hallsService.currentHall$.subscribe((hall) => {
      this.currentHall = hall;
    });
    this.subs.add(hallSub);
  }

  get formControls() {
    return this.form.controls;
  }

  cleanup() {
    this.form.reset();
    this.event = null;
  }

  submit(): void {
    if (this.form.invalid || !this.currentHall?.id) {
      return;
    }

    let payload = {
      name: this.form.value.name ?? '',
      name_ar: this.form.value.name_ar ?? '',
      description: this.form.value.description ?? '',
      halls: [
        {
          id: this.currentHall.id,
        },
      ],
    };

    const submissionApi =
      this.mode === 'add'
        ? this.eventsService.addEvent(payload)
        : this.eventsService.updateEvent(this.event?.id!, payload);

    submissionApi.subscribe({
      next: () => {
        this.drawerService.close();
        this.refreshDataTable.emit();
      },
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

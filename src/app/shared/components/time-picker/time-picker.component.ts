import {Component, Input} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import moment from 'moment';

@Component({
    selector: 'app-time-picker',
    templateUrl: './time-picker.component.html',
    styleUrl: './time-picker.component.scss',
    standalone: false
})
export class TimePickerComponent {
  @Input() showLabel = true;
  @Input() label!: string;
  @Input({required: true}) control!: AbstractControl;
  @Input({required: true}) controlName = '';
  @Input() placeholder: string = '';
  @Input() iconClass: string | null = null;
  @Input() hoursOnly = false;

  selectedTime = '';

  onTimeSet(raw: string) {
    if (!this.hoursOnly) return;

    const m = moment(raw, ['h:mm A', 'HH:mm']).locale('en');
    m.minutes(0);
    this.selectedTime = m.format('hh:mm A');
  }
}

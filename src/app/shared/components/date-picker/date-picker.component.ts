import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {filter} from 'rxjs';
import {
  convertDateTo,
  isDateGregorian,
  isDateIslamic,
  stringifyDate,
  toNgbDateStruct,
  toNgbDateStructControl,
} from './helper/date-helper';
import moment from 'moment';

@Component({
    selector: 'app-date-picker',
    templateUrl: './date-picker.component.html',
    styleUrl: './date-picker.component.scss',
    standalone: false
})
export class DatePickerComponent implements OnInit, OnChanges {
  @Input({required: true})
  control!: FormControl<string | null | Date>;
  _control!: FormControl<NgbDateStruct | null>;
  @Input({required: true}) controlName = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() label = '';
  @Input({transform: toNgbDateStruct}) minDate!: NgbDateStruct;
  @Input({transform: toNgbDateStruct}) maxDate!: NgbDateStruct;
  @Input() placement = 'bottom-end';
  @Input() inputFieldStyle: {[key: string]: string} | null = {};

  @Input() calendarType: 'gregorian' | 'islamic' = 'islamic';

  @Output() onCalenderType = new EventEmitter<'gregorian' | 'islamic'>();
  convertedDate: string = '';

  ngOnInit(): void {
    this._control = toNgbDateStructControl(this.control);
    this._control.setValidators(this.control.validator);
    // Initialize the converted date if there value.
    this.setConvertedDate(this._control.value);

    if (this._control.value) {
      if (isDateGregorian(this._control.value)) {
        this.calendarType = 'gregorian';
      }
    }

    this._control.valueChanges
      .pipe(
        filter(
          () =>
            (this._control.value!! && this._control.valid) ||
            this._control.value === null,
        ),
      )
      .subscribe((value) => {
        if (value === null) {
          this.control.setValue(null);
          return;
        }
        // Set the converted date while value change event.
        this.setConvertedDate(value);

        // Adjust the emitted date to the local time zone
        const localDate = moment({
          year: value.year,
          month: value.month - 1,
          day: value.day,
          hour: moment().hour(),
          minute: moment().minute(),
          second: moment().second(),
        });
        this.control.setValue(localDate.toISOString(true));
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['calendarType']) {
      this.changeCalendarType(this.calendarType);
    }
  }

  changeCalendarType(type: 'gregorian' | 'islamic') {
    if (this._control?.hasError('ngbDate')) return;
    if (
      type === 'islamic' &&
      this._control?.value &&
      isDateIslamic(this._control?.value)
    )
      return;
    if (
      type === 'gregorian' &&
      this._control?.value &&
      isDateGregorian(this._control?.value)
    )
      return;

    this.calendarType = type;
    this.onCalenderType.emit(type);
    this._control?.value &&
      this._control?.setValue(convertDateTo(this._control.value, type));
  }

  stringifyDate(date: NgbDateStruct) {
    return stringifyDate(date);
  }

  private setConvertedDate(value: any) {
    if (!value) return;

    if (isDateGregorian(value!)) {
      this.calendarType = 'gregorian';
    } else {
      this.calendarType = 'islamic';
    }

    const convertedDate = convertDateTo(
      value!,
      this.calendarType === 'islamic' ? 'gregorian' : 'islamic',
    );
    this.convertedDate = stringifyDate(convertedDate);
  }

  resetDateValue() {
    this._control.reset();
    this.convertedDate = '';
  }
  enableControl() {
    this._control.enable();
  }
}

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Injectable,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {ShakeableInput} from '@core/interfaces';
import {GeorgianI18nService} from '@core/services/georgianI18n.service';
import {ShakeableService} from '@core/services/shakeable.service';
import {
  NgbCalendar,
  NgbCalendarGregorian,
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbInputDatepicker,
} from '@ng-bootstrap/ng-bootstrap';
import {fromEvent, Subscription} from 'rxjs';

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (!value) return null;

    const parts = value
      .trim()
      .split(/[\/\-\.\s]/)
      .filter(Boolean);

    if (parts.length !== 3) return null;

    let year: number, month: number, day: number;

    if (parts[0].length === 4) {
      // yyyy/mm/dd
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else {
      // dd/mm/yyyy
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
      if (year < 100) year += 2000; // optional century normalization
    }

    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day)
    ) {
      return null;
    }

    return {year, month, day};
  }

  format(date: NgbDateStruct | null): string {
    return date
      ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day
      : '';
  }
}

@Component({
  selector: 'app-gregorian-date-picker',
  templateUrl: './gregorian-date-picker.component.html',
  styleUrl: './gregorian-date-picker.component.scss',
  providers: [
    {provide: NgbCalendar, useClass: NgbCalendarGregorian},
    {provide: NgbDatepickerI18n, useClass: GeorgianI18nService},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter},
  ],
  standalone: false,
})
export class GregorianDatePickerComponent
  implements ShakeableInput, OnInit, OnDestroy
{
  @Input({required: true}) control!: AbstractControl;
  @Input() placeholder: string = '';
  @Input({required: true}) controlName = '';
  @Input() disabled = false;
  @Input() minDate!: NgbDateStruct;
  @Input() maxDate!: NgbDateStruct;
  @Input() placement = 'bottom-start';
  @Input() label = '';
  @Input() showClear = false;
  @Input() inputFieldStyle: {[key: string]: string} | null = {};
  shake = false;

  @HostBinding('class.disabled') get isDisabled() {
    return this.disabled;
  }

  @ViewChild('d') datepicker!: NgbInputDatepicker;

  @ViewChild('shakeableContent', {read: ElementRef})
  shakeableContent!: ElementRef;

  subs = new Subscription();

  constructor(
    private shakeableService: ShakeableService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.shakeableService.register(this);
  }

  ngAfterViewInit(): void {
    const animationEndSub = fromEvent(
      this.shakeableContent.nativeElement,
      'animationend',
    ).subscribe(() => {
      this.shake = false;
      this.cdr.detectChanges();
    });
    this.subs.add(animationEndSub);
  }

  clearDate() {
    this.control.setValue(null);
    this.control.markAsTouched();
    this.datepicker.close();
  }

  shakeInvalid() {
    if (this.control.invalid) {
      this.control.markAsTouched();
      this.shake = true;
    }
  }

  focused(): void {
    this.shake = false;
  }

  blurred(): void {
    if (this.control.invalid) {
      this.shake = true;
    }
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.shakeableService.unregister(this);
  }
}

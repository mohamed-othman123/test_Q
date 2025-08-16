import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Injectable,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {ShakeableInput} from '@core/interfaces';
import {Islamic18nService} from '@core/services/islamic18n.service';
import {
  NgbCalendar,
  NgbCalendarIslamicUmalqura,
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbInputDatepicker,
} from '@ng-bootstrap/ng-bootstrap';
import {fromEvent, Subscription} from 'rxjs';
import {OnInit} from '@angular/core';
import {ShakeableService} from '@core/services/shakeable.service';
import {convertDateTo} from '../date-picker/helper/date-helper';

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date
      ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day
      : '';
  }
}

@Component({
    selector: 'app-islamic-date-picker',
    templateUrl: './islamic-date-picker.component.html',
    styleUrl: './islamic-date-picker.component.scss',
    providers: [
        { provide: NgbCalendar, useClass: NgbCalendarIslamicUmalqura },
        { provide: NgbDatepickerI18n, useClass: Islamic18nService },
        { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
    ],
    standalone: false
})
export class IslamicDatePickerComponent
  implements ShakeableInput, AfterViewInit, OnDestroy, OnInit
{
  @Input({required: true}) control!: AbstractControl;
  @Input() placeholder: string = '';
  @Input({required: true}) controlName = '';
  @Input() disabled = false;
  @Input({transform: (value: any) => convertDateTo(value, 'islamic')})
  minDate!: NgbDateStruct;
  @Input() maxDate!: NgbDateStruct;
  @Input() placement = 'bottom-end';
  @Input() label = '';
  @Input() inputFieldStyle: {[key: string]: string} | null = {};

  shake = false;
  subs = new Subscription();
  @ViewChild('shakeableContent', {read: ElementRef})
  shakeableContent!: ElementRef;

  @HostBinding('class.disabled') get isDisabled() {
    return this.disabled;
  }

  @ViewChild('d') datepicker!: NgbInputDatepicker;

  constructor(
    private shakeableService: ShakeableService,
    private cdr: ChangeDetectorRef,
  ) {}

  shakeInvalid() {
    if (this.control.invalid) {
      this.control.markAsTouched();
      this.shake = true;
    }
  }

  ngOnInit(): void {
    this.shakeableService.register(this);
    if (this.disabled) {
      this.control.disable();
    }
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

  focused(): void {
    this.shake = false;
  }

  blurred(): void {
    if (this.control.invalid) {
      this.shake = true;
    }
  }

  clearDate() {
    this.control.setValue(null);
    this.control.markAsTouched();
    this.datepicker.close();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.shakeableService.unregister(this);
  }
}

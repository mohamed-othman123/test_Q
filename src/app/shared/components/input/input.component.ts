import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {SHAKEABLE_INPUT} from '@core/constants';
import {ShakeableInput} from '@core/interfaces';
import {ShakeableService} from '@core/services/shakeable.service';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {fromEvent, Subscription} from 'rxjs';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: SHAKEABLE_INPUT,
      useExisting: forwardRef(() => InputComponent),
    },
  ],
  standalone: false,
})
export class InputComponent
  implements OnInit, OnDestroy, ShakeableInput, AfterViewInit
{
  /**
   * path to error translation key in translations files
   * @example error.required
   */
  @Input() pathToErrorTranslation = 'errors';
  @Input() placement: 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start' =
    'bottom-end';
  @Input() showLabel = true;
  @Input() iconPath?: string;
  @Input() percent = false;
  @Input({required: true}) control!: AbstractControl;
  @Input() autoComplete = 'on';

  @Input() set isSubmitted(value: boolean) {
    if (value) {
      this.setError();
    }
  }

  @Input() label!: string;
  @Input() labelTranslationKey!: string;
  @Input() inputType:
    | 'text'
    | 'password'
    | 'email'
    | 'tel'
    | 'number'
    | 'textarea'
    | 'date' = 'text';
  @Input() placeholder: string = '';
  @Input({required: true}) controlName = '';
  @Input() pattern = '';
  @Input() disabled = false;
  @Input() minDate!: NgbDateStruct;
  @Input() maxDate!: NgbDateStruct;
  @Input() toolTipText!: string;
  @Input() rowsNo = 5;
  @Input() showClear = false;
  @Input() alwaysShowClear = false;
  @Input() textAlign = 'start';
  @Input() isIconPicker = false;
  @Input() integerOnly = false;
  integerPattern = '^\\d+$';

  // Google analytics Inputs
  @Input() formName = '';
  @Input() enableTracking = false;

  shake = false;
  @Output() onBlur = new EventEmitter();

  @Output() onClear = new EventEmitter();

  @Output() onChange = new EventEmitter();

  @HostBinding('class.disabled') get isDisabled() {
    return this.disabled;
  }

  @ViewChild('input', {read: ElementRef})
  inputElem!: ElementRef;

  @ViewChild('shakeableContent', {read: ElementRef})
  shakeableContent!: ElementRef;
  subs = new Subscription();
  translatedError: string = '';
  tooltipPosition!: 'top' | 'right';
  @Input() showRequiredError: boolean = true;

  constructor(
    private translate: TranslateService,
    bpObserver: BreakpointObserver,
    private shakeableService: ShakeableService,
  ) {
    //set tooltip position in mobile view and desktop view
    const obsSub = bpObserver
      .observe([Breakpoints.Small, Breakpoints.XSmall])
      .subscribe((observeResult) => {
        const isMobileView = observeResult.matches;
        if (isMobileView) {
          this.tooltipPosition = 'top';
        } else {
          this.tooltipPosition = 'right';
        }
      });
    this.subs.add(obsSub);

    const translateSub = translate.onLangChange.subscribe(() => {
      this.setError();
    });
    this.subs.add(translateSub);
  }

  ngOnInit(): void {
    this.shakeableService.register(this);
    if (this.disabled) {
      this.control.disable();
    }
  }

  ngAfterViewInit(): void {
    if (this.shakeableContent) {
      const animationEndSub = fromEvent(
        this.shakeableContent.nativeElement,
        'animationend',
      ).subscribe(() => {
        this.shake = false;
      });
      this.subs.add(animationEndSub);
    }
  }

  shakeInvalid() {
    if (this.control.invalid && this.control.touched) {
      this.shake = true;
      this.setError();
    }
  }

  setError() {
    const label = this.labelTranslationKey
      ? this.translate.instant(this.labelTranslationKey)
      : this.label;

    if (this.control.errors) {
      const error = Object.keys(this.control.errors as Object);
      const lastError = error[error.length - 1];

      if (lastError === 'pattern') {
        if (this.controlName === 'taxRegistrationNumber') {
          this.translatedError = this.translate.instant(
            'errors.taxRegistrationNumberPattern',
          );
          return;
        } else if (this.controlName === 'commercialRegistrationNumber') {
          this.translatedError = this.translate.instant(
            'errors.commercialRegistrationNumberPattern',
          );
          return;
        } else if (this.controlName === 'hallName') {
          this.translatedError = this.translate.instant(
            'errors.hallNamePattern',
          );
          return;
        } else if (this.controlName === 'site_url') {
          this.translatedError = this.translate.instant(
            'errors.websitePattern',
          );
          return;
        }
      }

      if (lastError === 'required' && this.showRequiredError) {
        this.translatedError = this.translate.instant(
          `${this.pathToErrorTranslation}.${lastError}`,
          {fieldName: label},
        );
        return;
      }
      if (lastError === 'minlength') {
        this.translatedError = this.translate.instant(
          `${this.pathToErrorTranslation}.${lastError}`,
          {
            fieldName: label,
            requiredLength: this.control.errors?.['minlength'].requiredLength,
          },
        );
        return;
      }
      if (lastError === 'maxlength') {
        this.translatedError = this.translate.instant(
          `${this.pathToErrorTranslation}.${lastError}`,
          {
            fieldName: label,
            maxLength: this.control.errors?.['maxlength'].requiredLength,
          },
        );
        return;
      }
      if (lastError === 'min') {
        this.translatedError = this.translate.instant(
          `${this.pathToErrorTranslation}.${lastError}`,
          {
            fieldName: label,
            requiredLength: this.control.errors?.['min'].min,
          },
        );

        return;
      }
      if (lastError === 'max') {
        this.translatedError = this.translate.instant(
          `${this.pathToErrorTranslation}.${lastError}`,
          {
            fieldName: label,
            maxValue: this.control.errors?.['max'].max,
          },
        );

        return;
      }
      if (lastError === 'pattern') {
        this.translatedError = this.translate.instant(
          `${this.pathToErrorTranslation}.${lastError}`,
          {
            fieldName: label,
          },
        );

        return;
      }

      if (lastError === 'doubleSpace') {
        this.translatedError = this.translate.instant(
          `${this.pathToErrorTranslation}.${lastError}`,
          {
            fieldName: label,
          },
        );
        return;
      }

      if (this.showRequiredError) {
        this.translatedError = this.translate.instant(
          `${this.pathToErrorTranslation}.${lastError}`,
        );
        if (
          lastError === this.translatedError ||
          this.translatedError === `${this.pathToErrorTranslation}.${lastError}`
        ) {
          console.warn(
            `the ${this.controlName} control does not have a translation for its error keys or the path to the translation obj is wrong , please provide a translation for the errorKey => ${lastError}`,
          );
        }
      }
    }
  }

  onInputChange() {
    this.onChange.emit(this.control.value);
  }

  showHidePassword() {
    this.inputElem.nativeElement.type === 'text'
      ? (this.inputElem.nativeElement.type = 'password')
      : (this.inputElem.nativeElement.type = 'text');
  }

  focused() {
    this.shake = false;
  }

  blurred() {
    this.setError();
    this.shake = true;
    this.onBlur.emit();
  }

  onClearListener() {
    this.control.setValue('');
    this.control.markAsPristine();
    this.control.updateValueAndValidity();
    this.onClear.emit(true);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.shakeableService.unregister(this);
  }
}

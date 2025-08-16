import {
  AfterViewInit,
  ChangeDetectorRef,
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
import {TranslateService} from '@ngx-translate/core';
import {fromEvent, Subscription} from 'rxjs';
import {SHAKEABLE_INPUT} from '@core/constants';
import {ShakeableInput} from '@core/interfaces';
import {ShakeableService} from '@core/services/shakeable.service';
import {DrawerService} from '@core/services/drawer.service';
import {Router} from '@angular/router';
import {Dropdown} from 'primeng/dropdown';

@Component({
    selector: 'app-dropdown',
    templateUrl: './dropdown.component.html',
    styleUrl: './dropdown.component.scss',
    providers: [
        {
            provide: SHAKEABLE_INPUT,
            useExisting: forwardRef(() => DropdownComponent),
        },
    ],
    standalone: false
})
export class DropdownComponent
  implements OnInit, AfterViewInit, OnDestroy, ShakeableInput
{
  @ViewChild('dropdown') dropdown!: Dropdown;

  @Input({required: true}) options: unknown[] = [];
  @Input() pathToErrorTranslation = 'errors';
  @Input() iconPath?: string;
  @Input({required: true}) control!: AbstractControl;
  @Input() label!: string;
  @Input() showLabel = true;
  @Input() placeholder = '';
  @Input({required: true}) controlName = '';
  @Input() pattern = '';
  @Input() disabled = false;
  @Input() showClear = false;
  @Input() filterBy = '';
  @Input({required: true}) optionLabel = '';
  @Input() optionValue = '';
  @Input() filter = false;
  @Input() addingNewHall = false;
  @Input() emptyMessage!: string;
  @Input() appendTo!: string;
  @Input() showAddNew = false;
  @Input() addNewLabel = '';
  @Input() dataKey: any;

  @Input() formName = '';
  @Input() enableTracking = false;

  @HostBinding('class.disabled') get isDisabled() {
    return this.disabled;
  }

  @ViewChild('shakeableContent', {read: ElementRef})
  shakeableContent!: ElementRef;

  @Output() onChange = new EventEmitter();
  @Output() onAddNew = new EventEmitter();
  @Output() onClear = new EventEmitter();

  private subs = new Subscription();
  translatedError = '';

  shake = false;

  constructor(
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private shakeableService: ShakeableService,
    private drawerService: DrawerService,
    private router: Router,
  ) {
    const translateSub = translate.onLangChange.subscribe(() => {
      this.setError();
    });
    this.subs.add(translateSub);
  }

  ngOnInit(): void {
    const sub = this.control.valueChanges.subscribe((value) => {
      if (this.dropdown) {
        this.dropdown.selectedOption = this.control.value;
      }
    });
    this.subs.add(sub);
    this.shakeableService.register(this);
    if (this.disabled) {
      this.control.disable();
    }
  }

  shakeInvalid() {
    if (this.control.invalid && this.control.touched) {
      this.shake = true;
      this.setError();
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

  setError(): void {
    if (this.control.errors) {
      const errors = Object.keys(this.control.errors);
      const lastError = errors[errors.length - 1];

      const params =
        lastError === 'required' ? {fieldName: this.label} : undefined;

      this.translatedError = this.translate.instant(
        `${this.pathToErrorTranslation}.${lastError}`,
        params,
      );

      const isTranslationMissing =
        lastError === this.translatedError ||
        this.translatedError === `${this.pathToErrorTranslation}.${lastError}`;

      if (isTranslationMissing) {
        console.warn(
          `the ${this.controlName} control does not have a translation for its error keys or the path to the translation obj is wrong , please provide a translation for the errorKey => ${lastError}`,
        );
      }
    }
  }

  handleChange(): void {
    this.setError();
    this.onChange.emit(this.control.value);
  }

  focused(): void {
    this.shake = false;
  }

  blurred(): void {
    if (this.control.invalid) {
      this.setError();
      this.shake = true;
    }
  }

  addNewHall(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/halls']).then(() => {
      this.drawerService.open({
        mode: 'add',
        title: 'halls.addNewHall',
      });
    });
  }

  addNewItem() {
    this.onAddNew.emit();
  }

  valueCleared() {
    this.onClear.emit();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.shakeableService.unregister(this);
  }
}

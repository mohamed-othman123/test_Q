import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import IconPicker from 'vanilla-icon-picker';

@Directive({
    selector: '[appIconPicker]',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: VanillaIconPickerDirective,
            multi: true,
        },
    ],
    standalone: false
})
export class VanillaIconPickerDirective
  implements OnInit, OnDestroy, ControlValueAccessor
{
  private iconPicker!: IconPicker;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  @Output() iconSelected = new EventEmitter<string>();

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private translateService: TranslateService,
  ) {}

  ngOnInit() {
    const translations = {
      'input:placeholder': this.translateService.instant(
        'landing.iconPicker.placeholder',
      ),
      'text:title': this.translateService.instant('landing.iconPicker.title'),
      'text:empty': this.translateService.instant('landing.iconPicker.empty'),
      'btn:save': this.translateService.instant('landing.iconPicker.save'),
    };

    this.iconPicker = new IconPicker(this.el.nativeElement, {
      theme: 'bootstrap-5',
      iconSource: [
        'FontAwesome Brands 6',
        'FontAwesome Solid 6',
        'FontAwesome Regular 6',
      ],
      closeOnSelect: true,
      i18n: translations,
    });

    this.iconPicker.on('select', (instance) => {
      this.onChange(instance.value);
      this.onTouched();
      this.iconSelected.emit(instance.value);
    });

    this.translateService.onLangChange.subscribe(() => {
      const newTranslations = {
        'input:placeholder': this.translateService.instant(
          'landing.iconPicker.placeholder',
        ),
        'text:title': this.translateService.instant('landing.iconPicker.title'),
        'text:empty': this.translateService.instant('landing.iconPicker.empty'),
        'btn:save': this.translateService.instant('landing.iconPicker.save'),
      };

      this.iconPicker.destroy();
      this.iconPicker = new IconPicker(this.el.nativeElement, {
        theme: 'bootstrap-5',
        iconSource: [
          'FontAwesome Brands 6',
          'FontAwesome Solid 6',
          'FontAwesome Regular 6',
        ],
        closeOnSelect: true,
        i18n: newTranslations,
      });
    });
  }

  ngOnDestroy() {
    if (this.iconPicker) {
      this.iconPicker.destroy();
    }
  }

  writeValue(value: string): void {
    if (this.iconPicker && value) {
      this.el.nativeElement.value = value;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }
}

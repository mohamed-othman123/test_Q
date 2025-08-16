import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {SHAKEABLE_INPUT} from '@core/constants';
import {ShakeableInput} from '@core/interfaces';
import {CountryISO, SearchCountryField} from 'ngx-intl-tel-input';
import {fromEvent, Subscription} from 'rxjs';
import {LanguageService} from '@core/services';
import {ParsedPhoneNumber} from '@core/models/ParsedPhoneNumber';
import {CountryCode, parsePhoneNumber} from 'libphonenumber-js';
import {ShakeableService} from '@core/services/shakeable.service';

@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
  providers: [
    {
      provide: SHAKEABLE_INPUT,
      useExisting: forwardRef(() => PhoneInputComponent),
    },
  ],
  standalone: false,
})
export class PhoneInputComponent
  implements ShakeableInput, OnInit, AfterViewInit, OnChanges, OnDestroy
{
  @Input() control!: FormControl;
  @Input() selectedCountry: CountryISO = CountryISO.SaudiArabia;
  @Input() label!: string;
  @Input() placeholder!: string;
  @Input() phoneNumber?: string;
  @Input() isViewOnly = false;

  @Output() countryChange = new EventEmitter<any>();

  shake = false;
  @ViewChild('phoneInputContainer') phoneInputContainer!: ElementRef;
  subs = new Subscription();
  readonly SearchCountryField = SearchCountryField;
  readonly defaultCountry: CountryISO = CountryISO.SaudiArabia;
  readonly allowedCountries: CountryISO[] = [
    CountryISO.SaudiArabia,
    CountryISO.UnitedArabEmirates,
    CountryISO.Kuwait,
    CountryISO.Bahrain,
    CountryISO.Qatar,
    CountryISO.Oman,
    CountryISO.Egypt,
  ];

  countryPlaceholders: {[key: string]: string} = {
    'sa': '055 123 4567', // Saudi Arabia
    'ae': '050 123 4567', // United Arab Emirates
    'kw': '500 12345', // Kuwait
    'bh': '3500 1234', // Bahrain
    'qa': '3312 3456', // Qatar
    'om': '9212 3456', // Oman
    'eg': '010 1234 5678', // Egypt
  };

  constructor(
    public languageService: LanguageService,
    private shakeableService: ShakeableService,
  ) {}

  ngOnInit(): void {
    this.shakeableService.register(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['phoneNumber'] && this.control) {
      const value = changes['phoneNumber'].currentValue;
      if (value) {
        const parsedValue = this.parsePhoneNumber(value);
        this.control.setValue(parsedValue.number);
        if (parsedValue.countryCode) {
          this.selectedCountry = parsedValue.countryCode as CountryISO;
        } else {
          this.selectedCountry = this.defaultCountry;
        }
      } else {
        this.control.setValue(null);
        this.selectedCountry = this.defaultCountry;
      }
    }
  }

  getCustomPlaceholder() {
    return this.countryPlaceholders[this.selectedCountry.toLowerCase()] || '';
  }

  setError() {}

  shakeInvalid() {
    if (this.control.invalid && this.control.touched) {
      this.shake = true;
      this.setError();
    }
  }

  onCountryChange(event: any) {
    this.countryChange.emit(event);

    this.selectedCountry = event.iso2 as CountryISO;
  }

  private parsePhoneNumber(phone: string): ParsedPhoneNumber {
    try {
      const countryCode = this.getCountryCode(this.selectedCountry);
      const parsedNumber = parsePhoneNumber(phone, countryCode);
      return {
        number: parsedNumber.nationalNumber,
        internationalNumber: parsedNumber.formatInternational(),
        nationalNumber: parsedNumber.formatNational(),
        e164Number: parsedNumber.number,
        countryCode: parsedNumber.country || '',
        dialCode: '+' + parsedNumber.countryCallingCode,
      };
    } catch (error) {
      return {
        number: phone,
        internationalNumber: phone,
        nationalNumber: phone,
        e164Number: phone,
        countryCode: '',
        dialCode: '',
      };
    }
  }

  private getCountryCode(countryISO: CountryISO): CountryCode {
    return countryISO.toUpperCase() as CountryCode;
  }

  ngAfterViewInit(): void {
    if (this.phoneInputContainer) {
      const animationEndSub = fromEvent(
        this.phoneInputContainer.nativeElement,
        'animationend',
      ).subscribe(() => {
        this.shake = false;
      });
      this.subs.add(animationEndSub);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.shakeableService.unregister(this);
  }
}

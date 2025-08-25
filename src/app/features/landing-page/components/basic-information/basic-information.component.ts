import {
  ControlContainer,
  FormControl,
  FormGroup,
  FormGroupDirective,
} from '@angular/forms';
import {LandingGeneralInformationDto} from '@admin-landing-page/models/landing-page.model';
import {LandingPageService} from '@admin-landing-page/services/landing-page.service';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {ParsedPhoneNumber} from '@core/models/ParsedPhoneNumber';
import {HallsService} from '@halls/services/halls.service';
import {Hall} from '@halls/models/halls.model';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-basic-information',
  templateUrl: './basic-information.component.html',
  styleUrls: ['./basic-information.component.scss'],
  viewProviders: [{provide: ControlContainer, useExisting: FormGroupDirective}],
  standalone: false,
})
export class BasicInformationComponent implements OnChanges, OnInit, OnDestroy {
  @Output() landingPageCreated =
    new EventEmitter<LandingGeneralInformationDto>();
  @Output() cancelBasicForm = new EventEmitter<void>();
  @Input() landingPageData: LandingGeneralInformationDto | null = null;
  @Input() startInEditMode = false;

  isEditMode = false;
  hasExistingData = false;
  currentHall: Hall | null = null;
  subs = new Subscription();
  formattedPhoneNumber: string = '';
  currentLang: string = 'en';

  constructor(
    private controlContainer: ControlContainer,
    private landingPageService: LandingPageService,
    private hallsService: HallsService,
    private translateService: TranslateService,
  ) {}

  ngOnInit() {
    const hallSub = this.hallsService.currentHall$.subscribe((hall) => {
      this.currentHall = hall;
    });
    this.subs.add(hallSub);

    const phoneSub = this.phoneNumberControl.valueChanges.subscribe((value) => {
      if (value && typeof value === 'object') {
        this.formattedPhoneNumber =
          value.e164Number || value.internationalNumber;
      }
    });
    this.subs.add(phoneSub);

    const langSub = this.translateService.onLangChange.subscribe(() => {
      this.currentLang = this.translateService.currentLang;
    });
    this.subs.add(langSub);
    this.currentLang = this.translateService.currentLang;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['landingPageData']) {
      if (this.landingPageData) {
        this.updateFormWithData(this.landingPageData);
      }
    }

    if (
      (changes['startInEditMode'] && this.startInEditMode) ||
      (changes['landingPageData'] && !this.landingPageData)
    ) {
      this.isEditMode = true;
    }
  }

  private updateFormWithData(data: LandingGeneralInformationDto) {
    this.hasExistingData = true;
    this.isEditMode = false;
    this.formattedPhoneNumber = data.phone;

    this.form.patchValue({
      landingPageId: data.id,
      hallId: data.hallId,
      hallName: data.hallName,
      email: data.email,
      phoneNumber: data.phone,
      aboutHall: data.about || '',
    });
  }

  get form(): FormGroup {
    return this.controlContainer.control as FormGroup;
  }

  get hallNameControl(): FormControl<string> {
    return this.form.get('hallName') as FormControl<string>;
  }

  get emailControl(): FormControl<string> {
    return this.form.get('email') as FormControl<string>;
  }

  get phoneNumberControl(): FormControl<ParsedPhoneNumber> {
    return this.form.get('phoneNumber') as FormControl<ParsedPhoneNumber>;
  }

  get aboutHallControl(): FormControl<string> {
    return this.form.get('aboutHall') as FormControl<string>;
  }

  toggleEditMode() {
    this.isEditMode = true;
  }

  cancelEdit() {
    this.isEditMode = false;
    if (this.landingPageData) {
      this.updateFormWithData(this.landingPageData);
    } else {
      this.cancelBasicForm.emit();
    }
  }

  isValidForm(): boolean {
    return (
      this.hallNameControl.valid &&
      this.emailControl.valid &&
      this.phoneNumberControl.valid &&
      this.aboutHallControl.valid
    );
  }

  onSaveBasicInformation() {
    if (!this.isValidForm()) {
      this.form.markAllAsTouched();
      return;
    }

    const phoneValue = this.phoneNumberControl.value;

    const basePayload = {
      hallName: this.hallNameControl.value,
      email: this.emailControl.value,
      phone:
        this.phoneNumberControl.value?.internationalNumber ||
        this.phoneNumberControl.value?.e164Number ||
        '',
      about: this.aboutHallControl.value || '',
    };

    const landingPageId = this.form.get('landingPageId')?.value;

    if (this.hasExistingData && landingPageId) {
      this.landingPageService
        .updateBasicInformation(basePayload, landingPageId)
        .subscribe({
          next: () => {
            this.isEditMode = false;
          },
        });
    } else {
      if (!this.currentHall?.id) {
        return;
      }

      const createPayload = {
        hallId: this.currentHall.id,
        hallName: this.hallNameControl.value,
        email: this.emailControl.value,
        phone: phoneValue?.e164Number || '',
        about: this.aboutHallControl.value || '',
        sections: [],
      };

      this.landingPageService.saveBasicInformation(createPayload).subscribe({
        next: (response) => {
          this.isEditMode = false;

          this.landingPageCreated.emit(response.data);

          if (this.currentHall?.id) {
            this.landingPageService
              .getLandingPageInformation(this.currentHall.id)
              .subscribe({
                next: (updatedData) => {
                  this.landingPageData = updatedData;
                  this.updateFormWithData(updatedData);
                },
              });
          }
        },
      });
    }
  }

  getPhoneAlignment(): string {
    return this.currentLang === 'ar' ? 'right' : 'left';
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}

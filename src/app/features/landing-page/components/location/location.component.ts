import {
  Component,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
} from '@angular/core';
import {
  ControlContainer,
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import {LandingPageService} from '../../services/landing-page.service';
import {NotificationService} from '@core/services/notification.service';
import {LandingGeneralInformationDto} from '@admin-landing-page/models/landing-page.model';
import {noDoubleSpaceValidator} from '@core/validators';

interface MapLocation {
  lat: number;
  long: number;
}

@Component({
    selector: 'app-location',
    templateUrl: './location.component.html',
    styleUrls: ['./location.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
    standalone: false
})
export class LocationComponent implements OnInit, OnChanges {
  @Input() landingPageData: LandingGeneralInformationDto | null = null;

  isEditMode = false;
  isSaving = false;

  constructor(
    private controlContainer: ControlContainer,
    private fb: FormBuilder,
    private landingPageService: LandingPageService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.initializeLocationForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['landingPageData'] && this.landingPageData) {
      this.updateLocation(this.landingPageData);
    }
  }

  private initializeLocationForm() {
    if (!this.form.contains('location')) {
      this.form.addControl(
        'location',
        this.fb.group({
          address: ['', [Validators.maxLength(500), noDoubleSpaceValidator()]],
          mapLocation: [null],
        }),
      );
    }
  }

  private updateLocation(data: LandingGeneralInformationDto) {
    this.isEditMode = false;
    this.location.patchValue(
      {
        address: data.location || '',
        mapLocation: data.mapLocation || null,
      },
      {emitEvent: false},
    );
  }

  get addressValue(): string {
    return this.location.get('address')?.value || '';
  }

  get mapLocationValue(): any {
    return this.location.get('mapLocation')?.value;
  }

  onMapLocationSelected(location: MapLocation) {
    if (this.isEditMode) {
      this.location.patchValue({
        mapLocation: {
          lat: location.lat,
          long: location.long,
        },
      });
    }
  }

  get form(): FormGroup {
    return this.controlContainer.control as FormGroup;
  }

  get location(): FormGroup {
    return this.form.get('location') as FormGroup;
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  async saveLocation() {
    if (!this.landingPageData?.id || this.isSaving) {
      return;
    }

    if (this.location.invalid) {
      this.location.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    try {
      const updatedData = await this.landingPageService
        .updateLocation(this.landingPageData.id, {
          location: this.location.get('address')?.value || null,
          mapLocation: this.location.get('mapLocation')?.value,
        })
        .toPromise();

      if (updatedData) {
        this.landingPageData = {
          ...this.landingPageData,
          location: updatedData.location,
          mapLocation: updatedData.mapLocation,
        };
      }

      this.isEditMode = false;
    } catch (error) {
    } finally {
      this.isSaving = false;
    }
  }

  cancelEdit() {
    this.isEditMode = false;
    if (this.landingPageData) {
      this.updateLocation(this.landingPageData);
    }
  }
}

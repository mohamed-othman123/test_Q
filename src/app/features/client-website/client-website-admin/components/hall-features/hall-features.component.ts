import {Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild} from '@angular/core';
import {
  ControlContainer,
  FormArray,
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import {LandingPageService} from '../../services/landing-page.service';
import {LandingGeneralInformationDto} from '@client-website-admin/models/landing-page.model';
import {LandingPageSection} from '@client-website-admin/models/section.model';
import {FeatureResponseDto} from '@client-website-admin/models/feature.model';
import {noDoubleSpaceValidator} from '@core/validators';
import {NotificationService} from '@core/services';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-hall-features',
    templateUrl: './hall-features.component.html',
    styleUrls: ['./hall-features.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
    standalone: false
})
export class HallFeaturesComponent implements OnChanges {
  @Input() landingPageData: LandingGeneralInformationDto | null = null;
  @Input() section: LandingPageSection | null = null;

  @ViewChild('featuresList') featuresList!: ElementRef;

  maxFeatures = 10;
  activeFeature: FormGroup | null = null;
  isEditingExisting = false;

  constructor(
    private controlContainer: ControlContainer,
    private fb: FormBuilder,
    private landingPageService: LandingPageService,
    private notificationService: NotificationService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['landingPageData'] && this.section) {
      this.updateFeatures(this.section);
    }
  }

  private updateFeatures(data: LandingPageSection) {
    while (this.hallFeatures.length) {
      this.hallFeatures.removeAt(0);
    }

    if (data.features?.length) {
      data.features
        .sort((a, b) => a.order - b.order)
        .forEach((feature) => {
          this.hallFeatures.push(this.createFeatureGroup(feature));
        });
    }

  }

  private createFeatureGroup(feature?: any): FormGroup {
    return this.fb.group({
      id: [feature?.id || null],
      icon: [feature?.icon || '', Validators.required],
      title: [
        feature?.title || '',
        [
          Validators.required,
          Validators.maxLength(50),
          noDoubleSpaceValidator(),
        ],
      ],
      description: [
        feature?.description || '',
        [
          Validators.required,
          Validators.maxLength(200),
          noDoubleSpaceValidator(),
        ],
      ],
      order: [feature?.order || this.hallFeatures.length],
    });
  }

  get form(): FormGroup {
    return this.controlContainer.control as FormGroup;
  }

  get hallFeatures(): FormArray {
    return this.form.get('hallFeatures') as FormArray;
  }

  addFeature() {
    if (this.hallFeatures.length >= this.maxFeatures || this.activeFeature) {
      return;
    }

    const newFeature = this.createFeatureGroup();
    this.hallFeatures.push(newFeature);
    this.activeFeature = newFeature;
    this.isEditingExisting = false;
  }

  removeFeature(index: number) {
    const feature = this.hallFeatures.at(index);
    const featureId = feature.get('id')?.value;

    if (featureId) {
      this.landingPageService.removeFeature(featureId).subscribe({
        next: (response: FeatureResponseDto[]) => {
          if (this.section) {
            this.section.features = response;
            this.updateFormArrayFromResponse(response);
          }
          this.notificationService.showSuccess('landing.featureDeleted');
        },
      });
    } else {
      this.hallFeatures.removeAt(index);
      this.notificationService.showSuccess('landing.featureDeleted');
    }
  }

  onFeaturesDropped(event: CdkDragDrop<any[]>) {
    if (event.previousIndex !== event.currentIndex) {
      const controls = this.hallFeatures.controls;
      moveItemInArray(controls, event.previousIndex, event.currentIndex);

      const movedControl = controls[event.currentIndex];
      const featureId = movedControl.get('id')?.value;
      const newOrder = event.currentIndex + 1;

      if (featureId) {
        this.landingPageService.updateFeature(featureId, {
          order: newOrder,
        }).subscribe({
          next: (response: FeatureResponseDto[]) => {
            if (this.section) {
              this.section.features = response;
              this.updateFormArrayFromResponse(response);
            }
            this.notificationService.showSuccess('landing.featuresReordered');
          },
        });
      }
    }
  }

  cancelEdit() {
    if (this.activeFeature) {
      if (!this.isEditingExisting && !this.activeFeature.get('id')?.value) {
        const index = this.hallFeatures.controls.indexOf(this.activeFeature);
        if (index > -1) {
          this.hallFeatures.removeAt(index);
        }
      }
    }
    this.activeFeature = null;
    this.isEditingExisting = false;
  }

  editFeature(group: any) {
    if (this.activeFeature) {
      return;
    }

    this.activeFeature = group;
    this.isEditingExisting = true;
  }

  saveFeature() {
    if (!this.activeFeature || !this.landingPageData?.id || this.activeFeature.invalid) {
      return;
    }

    const featureData = this.activeFeature.value;
    const isEditing = featureData.id != null;

    const request = isEditing
      ? this.landingPageService.updateFeature(featureData.id, {
          ...featureData,
          order: featureData.order || this.hallFeatures.length + 1,
        })
      : this.landingPageService.addFeature({
          ...featureData,
          sectionId: this.section?.id,
          order: this.hallFeatures.length + 1,
        });

    request.subscribe({
      next: (response: FeatureResponseDto[]) => {
        if (this.section) {
          this.section.features = response;
          this.updateFormArrayFromResponse(response);
        }

        this.activeFeature = null;
        this.isEditingExisting = false;

        const messageKey = isEditing ? 'landing.featureUpdated' : 'landing.featureAdded';
        this.notificationService.showSuccess(messageKey);
      },
    });
  }

  handleIconChange(icon: string) {
    if (this.activeFeature) {
      this.activeFeature.patchValue({icon});
    }
  }

  private updateFormArrayFromResponse(response: FeatureResponseDto[]) {
    while (this.hallFeatures.length !== 0) {
      this.hallFeatures.removeAt(0);
    }

    const sortedResponse = response.sort((a, b) => a.order - b.order);

    sortedResponse.forEach(feature => {
      const formGroup = this.fb.group({
        id: [feature.id],
        title: [feature.title, [Validators.required, noDoubleSpaceValidator]],
        description: [feature.description, [Validators.required, noDoubleSpaceValidator]],
        icon: [feature.icon, Validators.required],
        order: [feature.order]
      });
      this.hallFeatures.push(formGroup);
    });
  }
}

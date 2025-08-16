import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {
  ControlContainer,
  FormArray,
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import {LandingPageService} from '../../services/landing-page.service';
import {UpdateFeatureDto} from '../../models/feature.model';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {LandingGeneralInformationDto} from '@admin-landing-page/models/landing-page.model';
import {LandingPageSection} from '@admin-landing-page/models/section.model';
import {noDoubleSpaceValidator} from '@core/validators';

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

  isEditMode = false;
  maxFeatures = 10;
  activeFeature: FormGroup | null = null;

  constructor(
    private controlContainer: ControlContainer,
    private fb: FormBuilder,
    private landingPageService: LandingPageService,
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

    this.isEditMode = false;
    this.activeFeature = null;
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

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    this.activeFeature = null;
  }

  hasInvalidFeature(): boolean {
    return this.hallFeatures.controls.some((control) => {
      const feature = control as FormGroup;
      return (
        feature.invalid ||
        !feature.get('title')?.value?.trim() ||
        !feature.get('description')?.value?.trim() ||
        !feature.get('icon')?.value?.trim()
      );
    });
  }

  addFeature() {
    if (
      this.hallFeatures.length >= this.maxFeatures ||
      this.hasInvalidFeature() ||
      this.activeFeature
    ) {
      return;
    }

    const newFeature = this.createFeatureGroup();
    this.hallFeatures.push(newFeature);
    this.activeFeature = newFeature;
    this.isEditMode = true;
  }

  cancelEdit() {
    if (this.activeFeature) {
      if (!this.activeFeature.get('id')?.value) {
        const index = this.hallFeatures.controls.indexOf(this.activeFeature);
        if (index > -1) {
          this.hallFeatures.removeAt(index);
        }
      }
    }

    this.activeFeature = null;
    if (this.section) {
      this.updateFeatures(this.section);
    }
  }

  editFeature(group: any) {
    this.activeFeature = group;
  }

  saveFeature() {
    if (
      !this.activeFeature ||
      !this.landingPageData?.id ||
      this.activeFeature.invalid
    ) {
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
      next: (response) => {
        if (!isEditing) {
          const index = this.hallFeatures.controls.indexOf(this.activeFeature!);
          if (index > -1) {
            this.hallFeatures.at(index).patchValue({
              id: response.id,
              ...response,
            });
          }
        }
        this.activeFeature = null;
      },
    });
  }

  removeFeature(index: number) {
    const feature = this.hallFeatures.at(index);
    const featureId = feature.get('id')?.value;

    if (featureId) {
      this.landingPageService.removeFeature(featureId).subscribe({
        next: () => this.hallFeatures.removeAt(index),
      });
    } else {
      this.hallFeatures.removeAt(index);
    }
  }

  onDrop(event: CdkDragDrop<any[]>) {
    moveItemInArray(
      this.hallFeatures.controls,
      event.previousIndex,
      event.currentIndex,
    );

    this.hallFeatures.controls.forEach((control, index) => {
      const featureId = control.get('id')?.value;
      if (featureId) {
        const updateData: UpdateFeatureDto = {
          title: control.get('title')?.value,
          description: control.get('description')?.value,
          icon: control.get('icon')?.value,
          order: index + 1,
        };

        this.landingPageService
          .updateFeature(featureId, updateData)
          .subscribe();
      }
    });
  }

  handleIconChange(icon: string) {
    if (this.activeFeature) {
      this.activeFeature.patchValue({icon});
    }
  }
}

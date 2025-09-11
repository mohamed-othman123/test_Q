import {Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
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
import {noDoubleSpaceValidator} from '@core/validators';
import {NotificationService} from '@core/services';
import {DragCoordinationService} from '@core/services/drag-coordination.service';
import Sortable from 'sortablejs';

@Component({
    selector: 'app-hall-features',
    templateUrl: './hall-features.component.html',
    styleUrls: ['./hall-features.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
    standalone: false
})
export class HallFeaturesComponent implements OnChanges, AfterViewInit {
  @Input() landingPageData: LandingGeneralInformationDto | null = null;
  @Input() section: LandingPageSection | null = null;

  @ViewChild('featuresList') featuresList!: ElementRef;

  maxFeatures = 10;
  activeFeature: FormGroup | null = null;
  isEditingExisting = false;
  private sortableInstance: Sortable | null = null;

  constructor(
    private controlContainer: ControlContainer,
    private fb: FormBuilder,
    private landingPageService: LandingPageService,
    private notificationService: NotificationService,
    private dragCoordination: DragCoordinationService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['landingPageData'] && this.section) {
      this.updateFeatures(this.section);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.initializeSortable(), 500);
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

    this.initializeSortable();
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
    this.initializeSortable();
  }

  removeFeature(index: number) {
    const feature = this.hallFeatures.at(index);
    const featureId = feature.get('id')?.value;

    if (featureId) {
      this.landingPageService.removeFeature(featureId).subscribe({
        next: () => {
          this.hallFeatures.removeAt(index);
          this.initializeSortable();
          this.notificationService.showSuccess('landing.featureDeleted');
        },
      });
    } else {
      this.hallFeatures.removeAt(index);
      this.initializeSortable();
      this.notificationService.showSuccess('landing.featureDeleted');
    }
  }

  private initializeSortable() {
    if (this.featuresList?.nativeElement) {
      if (this.sortableInstance) {
        this.sortableInstance.destroy();
      }

      this.sortableInstance = Sortable.create(this.featuresList.nativeElement, {
        animation: 150,
        handle: '.feature-drag-handle',
        disabled: !!this.activeFeature || this.dragCoordination.shouldDisableDrag('features', 'main-sections'),
        onEnd: (evt) => {
          this.dragCoordination.endDrag();
          this.onSortableEnd(evt);
        },
        onStart: () => {
          this.dragCoordination.startDrag('features');
          return true;
        }
      });
    }
  }

  private onSortableEnd(evt: any) {
    const { oldIndex, newIndex } = evt;
    if (oldIndex !== newIndex) {
      const controls = this.hallFeatures.controls;
      const item = controls[oldIndex];
      controls.splice(oldIndex, 1);
      controls.splice(newIndex, 0, item);
      this.hallFeatures.controls.forEach((control, index) => {
        const featureId = control.get('id')?.value;
        if (featureId) {
          this.landingPageService.updateFeature(featureId, {
            title: control.get('title')?.value,
            description: control.get('description')?.value,
            icon: control.get('icon')?.value,
            order: index + 1,
          }).subscribe();
        }
      });

      this.notificationService.showSuccess('landing.featuresReordered');
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
    this.initializeSortable();
  }

  editFeature(group: any) {
    if (this.activeFeature) {
      return;
    }

    this.activeFeature = group;
    this.isEditingExisting = true;
    this.initializeSortable();
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
        this.isEditingExisting = false;
        this.initializeSortable();

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
}

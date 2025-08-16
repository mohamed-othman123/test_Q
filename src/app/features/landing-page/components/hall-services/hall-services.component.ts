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
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {LandingGeneralInformationDto} from '@admin-landing-page/models/landing-page.model';
import {LandingPageSection} from '@admin-landing-page/models/section.model';
import {noDoubleSpaceValidator} from '@core/validators';

@Component({
    selector: 'app-hall-services',
    templateUrl: './hall-services.component.html',
    styleUrls: ['./hall-services.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
    standalone: false
})
export class HallServicesComponent implements OnChanges {
  @Input() landingPageData: LandingGeneralInformationDto | null = null;
  @Input() section: LandingPageSection | null = null;

  maxServices = 10;
  isEditMode = false;

  constructor(
    private controlContainer: ControlContainer,
    private fb: FormBuilder,
    private landingPageService: LandingPageService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['landingPageData'] && this.section) {
      this.updateServices(this.section);
    }
  }

  private updateServices(data: LandingPageSection) {
    while (this.hallServices.length) {
      this.hallServices.removeAt(0);
    }

    if (data.services?.length) {
      const validServices = data.services.filter(
        (service) => service && service.trim(),
      );
      validServices.forEach((service) => {
        this.hallServices.push(
          this.fb.control(service, [
            Validators.required,
            Validators.maxLength(30),
            noDoubleSpaceValidator(),
          ]),
        );
      });
    }

    this.isEditMode = false;
  }

  get form(): FormGroup {
    return this.controlContainer.control as FormGroup;
  }

  get hallServices(): FormArray {
    return this.form.get('hallServices') as FormArray;
  }

  hasEmptyService(): boolean {
    return this.hallServices.controls.some((control) => {
      return !control.value?.trim() || control.invalid;
    });
  }

  addService() {
    if (
      this.hallServices.length < this.maxServices &&
      !this.hasEmptyService()
    ) {
      this.hallServices.push(
        this.fb.control('', [
          Validators.required,
          Validators.maxLength(30),
          noDoubleSpaceValidator(),
        ]),
      );
      this.isEditMode = true;
    }
  }

  removeService(index: number) {
    this.hallServices.removeAt(index);
    if (this.hallServices.length === 0) {
      this.isEditMode = false;
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.hallServices.controls,
      event.previousIndex,
      event.currentIndex,
    );
  }

  saveServices() {
    if (!this.landingPageData?.id) {
      return;
    }

    if (this.hallServices.invalid) {
      this.hallServices.markAllAsTouched();
      return;
    }

    const services = this.hallServices.controls
      .map((control) => control.value)
      .filter((service) => service && service.trim());

    this.landingPageService
      .updateServices(this.section?.id!, services)
      .subscribe({
        next: () => {
          this.isEditMode = false;
        },
      });
  }

  cancelEdit() {
    this.isEditMode = false;
    if (this.section) {
      this.updateServices(this.section);
    }
  }
}

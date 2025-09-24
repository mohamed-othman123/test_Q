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
import {noDoubleSpaceValidator} from '@core/validators';
import {NotificationService} from '@core/services';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

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

  @ViewChild('servicesList') servicesList!: ElementRef;

  maxServices = 10;
  activeService: any = null;
  isEditingExisting = false;
  private currentSavedServices: string[] = [];

  constructor(
    private controlContainer: ControlContainer,
    private fb: FormBuilder,
    private landingPageService: LandingPageService,
    private notificationService: NotificationService
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
      this.currentSavedServices = [...validServices];
    }

    this.activeService = null;
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
    if (this.hallServices.length >= this.maxServices || this.activeService) {
      return;
    }

    const newService = this.fb.control('', [
      Validators.required,
      Validators.maxLength(30),
      noDoubleSpaceValidator(),
    ]);
    this.hallServices.push(newService);
    this.activeService = newService;
    this.isEditingExisting = false;
  }

  removeService(index: number) {
    this.hallServices.removeAt(index);

    if (this.landingPageData?.id && this.section?.id) {
      const updatedServices = this.hallServices.controls
        .map(control => control.value?.trim())
        .filter(Boolean);

      this.landingPageService
        .updateServices(this.section.id, updatedServices)
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('landing.serviceDeleted');
          },
          error: () => {
            this.updateServices(this.section!);
            this.notificationService.showError('landing.serviceDeleteError');
          }
        });
    } else {
      this.notificationService.showSuccess('landing.serviceDeleted');
    }
  }

  onServicesDropped(event: CdkDragDrop<any[]>) {
    if (event.previousIndex !== event.currentIndex) {
      const controls = this.hallServices.controls;
      moveItemInArray(controls, event.previousIndex, event.currentIndex);

      this.updateServicesOrder();
      this.notificationService.showSuccess('landing.servicesReordered');
    }
  }

  private updateServicesOrder() {
    if (this.landingPageData?.id && this.section?.id) {
      const updatedServices = this.hallServices.controls
        .map(control => control.value?.trim())
        .filter(Boolean);

      this.landingPageService
        .updateServices(this.section.id, updatedServices)
        .subscribe();
    }
  }

  cancelEdit() {
    if (this.activeService) {
      if (!this.isEditingExisting && !this.activeService.value?.trim()) {
        const index = this.hallServices.controls.indexOf(this.activeService);
        if (index > -1) {
          this.hallServices.removeAt(index);
        }
      } else if (this.isEditingExisting) {
        const serviceIndex = this.hallServices.controls.indexOf(this.activeService);
        if (serviceIndex >= 0 && serviceIndex < this.currentSavedServices.length) {
          this.activeService.setValue(this.currentSavedServices[serviceIndex]);
        }
      }
    }
    this.activeService = null;
    this.isEditingExisting = false;
  }

  editService(control: any) {
    if (this.activeService) {
      return;
    }

    this.activeService = control;
    this.isEditingExisting = true;
  }

  saveService() {
    if (!this.activeService || !this.landingPageData?.id || this.activeService.invalid) {
      return;
    }

    const serviceValue = this.activeService.value?.trim();
    if (!serviceValue) {
      return;
    }

    this.landingPageService
      .updateServices(this.section?.id!, this.hallServices.controls.map(control => control.value?.trim()).filter(Boolean))
      .subscribe({
        next: () => {
          this.currentSavedServices = this.hallServices.controls.map(control => control.value?.trim()).filter(Boolean);
          this.activeService = null;
          this.isEditingExisting = false;
          this.notificationService.showSuccess('landing.serviceSaved');
        },
      });
  }
}

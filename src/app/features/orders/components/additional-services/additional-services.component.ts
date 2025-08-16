import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {LanguageService} from '@core/services';
import {BookingFacadeService} from '@orders/services/booking-facade.service';
import {OrderFormService} from '@orders/services/order-form.service';
import {Service} from '@services/models';
import {noDoubleSpaceValidator} from '@core/validators';

@Component({
    selector: 'app-additional-services',
    templateUrl: './additional-services.component.html',
    styleUrl: './additional-services.component.scss',
    standalone: false
})
export class AdditionalServicesComponent implements OnInit {
  @Input({required: true}) currentStep!: number;

  @Output() currentStepChange = new EventEmitter<number>();

  servicesForm = new FormGroup({
    service: new FormControl<Service | null>(null),
    notes: new FormControl<string | null>(null, [noDoubleSpaceValidator()]),
    price: new FormControl<number | null>({value: null, disabled: true}),
    isNew: new FormControl<boolean | null>(true),
  });

  selectedServices: Service[] = [];

  isExistingService = false;

  mode!: string;

  constructor(
    public lang: LanguageService,
    public bookingFacadeService: BookingFacadeService,
    private orderFormService: OrderFormService,
  ) {}

  ngOnInit(): void {
    const services =
      this.orderFormService.additionalServicesForm.controls.services.value;
    if (services) {
      this.selectedServices = services;
    }
    this.mode = this.orderFormService.mode;

    if (this.mode === 'view') {
      this.servicesForm.disable();
    }
  }

  get formControls() {
    return this.orderFormService.additionalServicesForm.controls;
  }

  get form() {
    return this.orderFormService.additionalServicesForm;
  }

  changeStep(step: number) {
    this.orderFormService.changeStep(step, this.form);
  }

  addService() {
    if (this.servicesForm.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isExistingService = false;

    const service = this.servicesForm.controls.service.value;
    const notes = this.servicesForm.controls.notes.value;
    if (service) {
      this.servicesForm.controls.service.setValue({
        ...service,
        note: notes ?? null,
        price: this.servicesForm.controls.price.value as number,
        isNew: true,
      });

      // Check if the service already exists in the selected services
      const existingServiceIndex = this.selectedServices.findIndex(
        (s) => s.id === service.id,
      );

      if (existingServiceIndex !== -1) {
        this.isExistingService = true;
        return;
      }

      this.selectedServices.push(this.servicesForm.controls.service.value!);
      this.formControls.services.setValue(this.selectedServices);
    }
    this.servicesForm.reset();
  }

  onServiceChange(service: Service) {
    this.isExistingService = false;
    this.servicesForm.controls.price.setValue(service.halls[0].price);
  }

  deleteService(index: number) {
    this.selectedServices.splice(index, 1);
    this.formControls.services.setValue(this.selectedServices);
  }
}

import {
  Client,
  Customer,
  LandingGeneralInformationDto,
} from '@admin-landing-page/models/landing-page.model';
import {LandingPageSection} from '@admin-landing-page/models/section.model';
import {LandingPageService} from '@admin-landing-page/services/landing-page.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component, Input} from '@angular/core';
import {
  ControlContainer,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {Hall} from '@halls/models/halls.model';

@Component({
    selector: 'app-hall-clients',
    templateUrl: './hall-clients.component.html',
    styleUrl: './hall-clients.component.scss',
    standalone: false
})
export class HallClientsComponent {
  @Input() landingPageData: LandingGeneralInformationDto | null = null;
  @Input() section: LandingPageSection | null = null;
  @Input() currentHall: Hall | null = null;

  isEditMode = false;

  maxClients = 10;

  activeClient: FormGroup | null = null;

  oldImage: string | null = null;

  constructor(
    private controlContainer: ControlContainer,
    private fb: FormBuilder,
    private landingPageService: LandingPageService,
  ) {}

  ngOnInit(): void {
    this.initializeClientArray(this.section?.customers!);
  }

  get form(): FormGroup {
    return this.controlContainer.control as FormGroup;
  }

  get hallClients() {
    return this.form.get('hallClients') as FormArray;
  }

  refreshData() {
    this.landingPageService
      .getLandingPageInformation(this.currentHall?.id!)
      .subscribe((landingPageData) => {
        const section = landingPageData.sections.find(
          (section) => section.type === 'customers',
        );
        this.initializeClientArray(section?.customers!);
      });
  }

  initializeClientArray(customers: Customer[]) {
    this.hallClients.clear();
    if (customers?.length) {
      customers.forEach((customer) => {
        this.hallClients.push(
          this.fb.group({
            id: [customer.id],
            image: [customer.imagePath, Validators.required],
            name: [customer.name],
            site_url: [customer.site_url],
            order: [customer.order],
          }),
        );
      });
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  addClient() {
    const clientControl = this.fb.group({
      name: [null, [Validators.required]],
      image: [null, Validators.required],
      site_url: [
        null,
        Validators.pattern(
          '^(?:https?://)?(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
        ),
      ],
      order: [null],
    });

    this.hallClients.push(clientControl);
    this.activeClient = clientControl;
    this.isEditMode = true;
  }

  editClient(client: FormGroup<any>) {
    this.clearInvalidClientData();
    this.activeClient = client;
    this.oldImage = client.get('image')?.value;
    this.isEditMode = true;
  }

  removeClient(index: number) {
    const client = this.hallClients.at(index);
    const featureId = client.get('id')?.value;

    if (featureId) {
      this.landingPageService.removeClient(featureId).subscribe({
        next: () => this.hallClients.removeAt(index),
      });
    } else {
      this.hallClients.removeAt(index);
    }
  }

  createClientData(adding: boolean) {
    const formDate = new FormData();
    formDate.append('name', this.activeClient?.get('name')?.value);

    if (this.activeClient?.get('site_url')?.value) {
      formDate.append('site_url', this.activeClient?.get('site_url')?.value);
    }

    if (this.activeClient?.get('order')?.value) {
      formDate.append('order', this.activeClient?.get('order')?.value);
    }

    if (adding) {
      formDate.append('image', this.activeClient?.get('image')?.value);
    } else {
      if (typeof this.activeClient?.get('image')?.value !== 'string') {
        formDate.append('image', this.activeClient?.get('image')?.value);
      }
    }

    if (adding) {
      formDate.append('sectionId', this.section?.id as unknown as string);
    }

    return formDate;
  }

  saveClient() {
    if (
      !this.activeClient ||
      !this.landingPageData?.id ||
      this.activeClient.invalid
    ) {
      return;
    }

    const clientData = this.activeClient.value;
    const isEditing = clientData.id != null;

    const request = isEditing
      ? this.landingPageService.updateClient(
          clientData.id,
          this.createClientData(false),
        )
      : this.landingPageService.addClient(this.createClientData(true));

    request.subscribe({
      next: () => {
        this.refreshData();
        this.activeClient = null;
      },
    });
  }

  getOrderOptions(totalItems: number): any[] {
    return Array.from({length: totalItems}, (_, i) => ({
      label: `${i + 1}`,
      value: i + 1,
    }));
  }

  clearInvalidClientData() {
    if (this.activeClient) {
      if (!this.activeClient.get('id')?.value) {
        const index = this.hallClients.controls.indexOf(this.activeClient);
        if (index > -1) {
          this.hallClients.removeAt(index);
        }
      }
    }
  }

  cancel(client: FormGroup) {
    if (
      client.invalid &&
      client.get('id')?.value &&
      !client.get('image')?.value
    ) {
      client.get('image')?.setValue(this.oldImage);
    }

    this.clearInvalidClientData();

    this.toggleEditMode();
    this.activeClient = null;
  }
}

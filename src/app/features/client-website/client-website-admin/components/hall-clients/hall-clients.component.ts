import {
  Client,
  Customer,
  LandingGeneralInformationDto,
} from '@client-website-admin/models/landing-page.model';
import {LandingPageSection} from '@client-website-admin/models/section.model';
import {LandingPageService} from '@client-website-admin/services/landing-page.service';
import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import {
  ControlContainer,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {Hall} from '@halls/models/halls.model';
import {NotificationService} from '@core/services';
import {DragCoordinationService} from '@core/services/drag-coordination.service';
import Sortable from 'sortablejs';

@Component({
  selector: 'app-hall-clients',
  templateUrl: './hall-clients.component.html',
  styleUrl: './hall-clients.component.scss',
  standalone: false,
})
export class HallClientsComponent implements AfterViewInit, OnDestroy {
  @Input() landingPageData: LandingGeneralInformationDto | null = null;
  @Input() section: LandingPageSection | null = null;
  @Input() currentHall: Hall | null = null;

  @ViewChild('clientsList') clientsList!: ElementRef;

  maxClients = 10;
  activeClient: any = null;
  isEditingExisting = false;
  private sortableInstance: Sortable | null = null;
  private currentSavedClients: any[] = [];

  constructor(
    private controlContainer: ControlContainer,
    private fb: FormBuilder,
    private landingPageService: LandingPageService,
    private notificationService: NotificationService,
    private dragCoordination: DragCoordinationService,
  ) {}

  ngOnInit(): void {
    this.initializeClientArray(this.section?.customers!);
  }

  ngAfterViewInit() {
    setTimeout(() => this.initializeSortable(), 500);
  }

  ngOnDestroy() {
    this.hallClients.controls.forEach((control) => {
      const imageValue = control.get('image')?.value;
      if (imageValue instanceof File) {
      }
    });

    if (this.sortableInstance) {
      this.sortableInstance.destroy();
    }
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
      this.currentSavedClients = [...customers];
    }
    this.activeClient = null;
    this.initializeSortable();
  }

  addClient() {
    if (this.hallClients.length >= this.maxClients || this.activeClient) {
      return;
    }

    if (this.activeClient) {
      this.cancelEdit();
    }

    const clientControl = this.fb.group({
      name: [null, [Validators.required]],
      image: [null, Validators.required],
      site_url: [
        null,
        Validators.pattern(
          '^(?:https?://)?(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
        ),
      ],
      order: [this.hallClients.length + 1],
    });

    this.hallClients.push(clientControl);
    this.activeClient = clientControl;
    this.isEditingExisting = false;
    this.initializeSortable();
  }

  editClient(client: any) {
    if (this.activeClient) {
      return;
    }

    this.activeClient = client;
    this.isEditingExisting = true;
    this.initializeSortable();
  }

  removeClient(index: number) {
    const client = this.hallClients.at(index);
    const clientId = client.get('id')?.value;

    if (clientId) {
      this.landingPageService.removeClient(clientId).subscribe({
        next: () => {
          this.hallClients.removeAt(index);
          this.initializeSortable();
          this.notificationService.showSuccess('landing.clientDeleted');
        },
      });
    } else {
      this.hallClients.removeAt(index);
      this.initializeSortable();
      this.notificationService.showSuccess('landing.clientDeleted');
    }
  }

  private initializeSortable() {
    if (this.clientsList?.nativeElement) {
      if (this.sortableInstance) {
        this.sortableInstance.destroy();
      }

      this.sortableInstance = Sortable.create(this.clientsList.nativeElement, {
        animation: 150,
        handle: '.client-drag-handle',
        disabled: !!this.activeClient || this.dragCoordination.shouldDisableDrag('clients', 'main-sections'),
        onEnd: (evt) => {
          this.dragCoordination.endDrag();
          this.onSortableEnd(evt);
        },
        onStart: () => {
          this.dragCoordination.startDrag('clients');
          return true;
        }
      });
    }
  }

  private onSortableEnd(evt: any) {
    const {oldIndex, newIndex} = evt;
    if (oldIndex !== newIndex) {
      const controls = this.hallClients.controls;
      const item = controls[oldIndex];
      controls.splice(oldIndex, 1);
      controls.splice(newIndex, 0, item);

      this.updateClientsOrder();

      this.notificationService.showSuccess('landing.clientsReordered');
    }
  }

  private updateClientsOrder() {
    this.hallClients.controls.forEach((control, index) => {
      const clientId = control.get('id')?.value;
      if (clientId) {
        const formData = new FormData();
        formData.append('name', control.get('name')?.value);
        if (control.get('site_url')?.value) {
          formData.append('site_url', control.get('site_url')?.value);
        }
        formData.append('order', (index + 1).toString());

        this.landingPageService.updateClient(clientId, formData).subscribe();
      }
    });
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
        this.isEditingExisting = false;
        this.initializeSortable();
        const messageKey = isEditing
          ? 'landing.clientUpdated'
          : 'landing.clientAdded';
        this.notificationService.showSuccess(messageKey);
      },
    });
  }

  getImageUrl(imageValue: any): string {
    if (!imageValue) {
      return '';
    }

    if (imageValue instanceof File) {
      return URL.createObjectURL(imageValue);
    }

    if (typeof imageValue === 'string') {
      return imageValue;
    }

    return '';
  }

  cancelEdit() {
    if (this.activeClient) {
      if (
        !this.activeClient.get('name')?.value?.trim() &&
        !this.activeClient.get('image')?.value
      ) {
        const index = this.hallClients.controls.indexOf(this.activeClient);
        if (index > -1) {
          this.hallClients.removeAt(index);
        }
      } else {
        const clientIndex = this.hallClients.controls.indexOf(
          this.activeClient,
        );
        if (clientIndex >= 0 && clientIndex < this.currentSavedClients.length) {
          this.activeClient.patchValue({
            name: this.currentSavedClients[clientIndex].name,
            site_url: this.currentSavedClients[clientIndex].site_url,
            image: this.currentSavedClients[clientIndex].imagePath,
          });
        }
      }
    }
    this.activeClient = null;
    this.isEditingExisting = false;
    this.initializeSortable();
  }
}

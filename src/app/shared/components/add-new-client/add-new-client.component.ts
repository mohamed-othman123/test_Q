import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Client, ClientType, Contact} from '@clients/models/client.model';
import {CustomersService} from '@clients/services/Customers.service';
import {noDoubleSpaceValidator, validateDoubleName} from '@core/validators';
import {Subscription, tap} from 'rxjs';
import {HallsService} from '@halls/services/halls.service';
import {DrawerService} from '@core/services/drawer.service';
import {extractNationalPhoneNumber} from '@core/utils';
import {LanguageService} from '@core/services';
import {FormMode} from '@core/models';
import {CommentType} from '../comments/models/comment';

@Component({
  selector: 'app-add-new-client',
  templateUrl: './add-new-client.component.html',
  styleUrls: ['./add-new-client.component.scss'],
  standalone: false,
})
export class AddNewClientComponent implements OnInit, OnDestroy {
  @Output() refreshDataTable = new EventEmitter<void>();
  client!: null | Client;
  initialFormValues: any = {};
  activeIndex: number = 0;
  commentType = CommentType;
  subs = new Subscription();
  disableFacilityTab = false;
  disableIndividualTab = false;
  disableGovernmentFacilityTap = false;

  mode: FormMode = 'add';

  clientExistsInSameHall: boolean = false;
  showForm = false;

  individualForm = this.fb.group({
    name: [
      '',
      [Validators.required, validateDoubleName(), noDoubleSpaceValidator()],
    ],
    address: this.createAddressForm(),
    phone: [null as any | null, Validators.required],
    email: [null, Validators.email],
    notes: ['', noDoubleSpaceValidator()],
    type: ['Individual'],
    gender: ['', Validators.required],
    isVIB: [false],
    contacts: this.fb.array([]),
    nationalOrResidencyId: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern(/^[12]\d{9}$/),
        noDoubleSpaceValidator(),
      ],
    ],
  });

  facilityForm = this.fb.group({
    name: [
      '',
      [Validators.required, validateDoubleName(), noDoubleSpaceValidator()],
    ],
    taxRegistrationNumber: [
      '',
      [
        Validators.required,
        Validators.minLength(15),
        Validators.maxLength(15),
        Validators.pattern(/^[1-9]\d{14}$/),
        noDoubleSpaceValidator(),
      ],
    ],
    commercialRegistrationNumber: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern(/^[1-9]\d{9}$/),
        noDoubleSpaceValidator(),
      ],
    ],
    address: this.createAddressForm(),
    phone: [null as any | null, Validators.required],
    email: ['', Validators.email],
    notes: ['', noDoubleSpaceValidator()],
    type: ['Facility'],
    isVIB: [false],
    contacts: this.fb.array([]),
  });

  governmentFacilityForm = this.fb.group({
    name: [
      '',
      [Validators.required, validateDoubleName(), noDoubleSpaceValidator()],
    ],
    address: this.createAddressForm(),
    phone: [null as any | null, Validators.required],
    email: ['', Validators.email],
    notes: ['', noDoubleSpaceValidator()],
    type: ['Governmental Facility'],
    isVIB: [false],
    contacts: this.fb.array([]),
  });

  constructor(
    private fb: FormBuilder,
    private clientsService: CustomersService,
    private hallsService: HallsService,
    private drawerService: DrawerService,
    public lang: LanguageService,
  ) {}

  get individualFormControls() {
    return this.individualForm.controls;
  }

  get facilityFormControls() {
    return this.facilityForm.controls;
  }

  get governmentFormControls() {
    return this.governmentFacilityForm.controls;
  }

  get individualContactsArray() {
    return this.individualForm.get('contacts') as FormArray;
  }

  get facilityContactsArray() {
    return this.facilityForm.get('contacts') as FormArray;
  }

  get governmentContactsArray() {
    return this.governmentFacilityForm.get('contacts') as FormArray;
  }

  ngOnInit(): void {
    const sub = this.drawerService.drawerState$.subscribe((state) => {
      if (state.visible) {
        this.client = state.data as Client;
        this.mode = state.mode;
        if (this.client) {
          this.setFormValues(this.client);
          this.storeInitialValues();
        }
      } else {
        this.resetForms();
      }
    });
    this.subs.add(sub);
  }

  checkDuplicateClient(
    type: 'Individual' | 'Facility' | 'Governmental Facility',
  ) {
    if (this.mode === 'edit') return;

    const filters: any = this.constructFiltersBasedOnType(type);

    if (Object.keys(filters).length === 0) return;

    this.clientsService
      .getClients(filters)
      .pipe(
        tap(() => {
          this.clientExistsInSameHall = false;
          this.resetForms();
        }),
      )
      .subscribe((res) => {
        if (res.items.length === 0) {
          this.showForm = true;
          return;
        }

        const currentHallId = this.hallsService.getCurrentHall()?.id;

        const currentClient = res.items[0];

        this.clientExistsInSameHall = currentClient?.halls!.some(
          (hall) => hall.id === currentHallId,
        );

        if (this.clientExistsInSameHall) {
          this.showForm = false;
          return;
        }

        this.showForm = true;
        this.client = currentClient;
        this.setFormValues(this.client);
        this.storeInitialValues();
        this.disableUnusedTab(this.client.type);
      });
  }

  constructFiltersBasedOnType(
    type: 'Individual' | 'Facility' | 'Governmental Facility',
  ) {
    const filters: any = {};
    switch (type) {
      case 'Individual':
        if (this.individualFormControls.nationalOrResidencyId.valid) {
          filters.nationalOrResidencyId =
            this.individualFormControls.nationalOrResidencyId.value;
          filters.type = 'Individual';
        }

        break;
      case 'Facility':
        if (this.facilityFormControls.commercialRegistrationNumber.valid) {
          filters.commercialRegistrationNumber =
            this.facilityFormControls.commercialRegistrationNumber.value;
          filters.type = 'Facility';
        }

        break;
      case 'Governmental Facility':
        if (this.governmentFormControls.name.valid) {
          filters.name = this.governmentFormControls.name.value;
          filters.type = 'Governmental Facility';
        }

        break;
    }

    return filters;
  }

  createAddressForm(): FormGroup {
    return this.fb.group({
      city: [null as string | null, [Validators.required]],
      district: [null as string | null, [Validators.required]],
      street: [null as string | null, [Validators.required]],
      buildingNumber: [null as string | null, [Validators.required]],
      unitNumber: [null as string | null],
      additionalNumber: [null as string | null],
      postalCode: [
        null as string | null,
        [Validators.required, Validators.minLength(5), Validators.maxLength(5)],
      ],
    });
  }

  resetForms() {
    this.disableFacilityTab = false;
    this.disableIndividualTab = false;
    this.disableGovernmentFacilityTap = false;

    const nationalOrResidencyId = this.individualForm.get(
      'nationalOrResidencyId',
    )?.value;
    this.individualForm.reset({
      type: 'Individual',
      nationalOrResidencyId: nationalOrResidencyId, // preserve value
    });

    const commercialRegistrationNumber = this.facilityForm.get(
      'commercialRegistrationNumber',
    )?.value;
    this.facilityForm.reset({
      type: 'Facility',
      commercialRegistrationNumber: commercialRegistrationNumber, // preserve value
    });

    const name = this.governmentFacilityForm.get('name')?.value;
    this.governmentFacilityForm.reset({
      name: name,
      type: 'Governmental Facility',
    });
    this.client = null;

    this.facilityContactsArray.clear();
    this.governmentContactsArray.clear();
    this.individualContactsArray.clear();

    this.showForm = false;
    this.clientExistsInSameHall = false;
  }

  storeInitialValues() {
    this.initialFormValues = {...this.getActiveForm().value};
  }

  getActiveForm(): FormGroup {
    switch (this.activeIndex) {
      case 0:
        return this.individualForm;
      case 1:
        return this.facilityForm;
      default:
        return this.governmentFacilityForm;
    }
  }

  populateThirdPartyArray(contacts: Contact[], formArray: FormArray) {
    contacts?.forEach((contact) => {
      const phone = extractNationalPhoneNumber(
        contact.phone as unknown as string,
      );
      const providerGroup = this.fb.group({
        name: [contact.name, [Validators.required]],
        email: [contact.email],
        phone: [phone, Validators.required],
        originalPhone: [contact.phone],
      });
      formArray.push(providerGroup);
    });
  }

  setFormValues(client: Client) {
    switch (client.type) {
      case 'Individual':
        this.individualForm.patchValue({
          name: client.name,
          email: client.email as any,
          address: {
            city: client.address?.city ?? null,
            district: client.address?.district ?? null,
            street: client.address?.street ?? null,
            buildingNumber: client.address?.buildingNumber ?? null,
            unitNumber: client.address?.unitNumber ?? null,
            additionalNumber: client.address?.additionalNumber ?? null,
            postalCode: client.address?.postalCode ?? null,
          },
          phone: extractNationalPhoneNumber(client.phone || ''),
          notes: client.notes || '',
          gender: client.gender,
          isVIB: client?.isVIB || false,
          nationalOrResidencyId: client.nationalOrResidencyId,
        });
        this.populateThirdPartyArray(
          client?.contacts!,
          this.individualContactsArray,
        );

        this.activeIndex = 0;
        break;
      case 'Facility':
        this.facilityForm.patchValue({
          name: client.name,
          email: client.email,
          address: {
            city: client.address?.city ?? null,
            district: client.address?.district ?? null,
            street: client.address?.street ?? null,
            buildingNumber: client.address?.buildingNumber ?? null,
            unitNumber: client.address?.unitNumber ?? null,
            additionalNumber: client.address?.additionalNumber ?? null,
            postalCode: client.address?.postalCode ?? null,
          },
          phone: extractNationalPhoneNumber(client.phone || ''),
          notes: client.notes || '',
          taxRegistrationNumber:
            client.companyDetails?.taxRegistrationNumber || '',
          commercialRegistrationNumber:
            client.companyDetails?.commercialRegistrationNumber || '',
          isVIB: client?.isVIB || false,
        });
        this.populateThirdPartyArray(
          client?.contacts!,
          this.facilityContactsArray,
        );

        this.activeIndex = 1;
        break;
      default:
        this.governmentFacilityForm.patchValue({
          name: client.name,
          email: client.email,
          address: {
            city: client.address?.city ?? null,
            district: client.address?.district ?? null,
            street: client.address?.street ?? null,
            buildingNumber: client.address?.buildingNumber ?? null,
            unitNumber: client.address?.unitNumber ?? null,
            additionalNumber: client.address?.additionalNumber ?? null,
            postalCode: client.address?.postalCode ?? null,
          },
          phone: extractNationalPhoneNumber(client.phone || ''),
          notes: client.notes || '',
          isVIB: client?.isVIB || false,
        });
        this.populateThirdPartyArray(
          client?.contacts!,
          this.governmentContactsArray,
        );

        this.activeIndex = 2;
    }

    this.disableUnusedTab(client.type);
    this.getActiveForm().updateValueAndValidity();

    this.getActiveForm().markAsPristine();
    this.getActiveForm().markAsUntouched();
  }

  disableUnusedTab(type: ClientType) {
    switch (type) {
      case 'Individual':
        this.disableFacilityTab = true;
        this.disableIndividualTab = false;
        this.disableGovernmentFacilityTap = true;
        break;
      case 'Facility':
        this.disableFacilityTab = false;
        this.disableIndividualTab = true;
        this.disableGovernmentFacilityTap = true;
        break;
      default:
        this.disableFacilityTab = true;
        this.disableIndividualTab = true;
        this.disableGovernmentFacilityTap = false;
    }
  }

  onTabChange(index: number) {
    this.activeIndex = index;
    this.clientExistsInSameHall = false;
  }

  getChangedValues(currentValues: any): any {
    const changes: any = {};

    Object.keys(currentValues).forEach((key) => {
      if (currentValues[key] !== this.initialFormValues[key]) {
        changes[key] = currentValues[key];
      }
    });

    return changes;
  }

  createRequestData() {
    switch (this.activeIndex) {
      case 0:
        return {
          name: this.individualForm.value.name,
          email: this.individualForm.value.email || null,
          phone: this.individualForm.value.phone.internationalNumber,
          notes: this.individualForm.value.notes,
          gender: this.individualForm.value.gender,
          isVIB: this.individualForm.value.isVIB || false,
          type: ClientType.Individual,
          nationalOrResidencyId:
            this.individualForm.value.nationalOrResidencyId,
          address: this.individualForm.value.address,
          hallId: this.hallsService.getCurrentHall()?.id,
          contacts:
            !this.client?.id &&
            this.individualForm?.get('contacts')?.value?.length === 0
              ? null
              : this.individualForm.get('contacts')?.value?.map((ele: any) => {
                  return {
                    name: ele?.name,
                    email: ele?.email,
                    phone: ele?.phone.internationalNumber,
                  };
                }),
        };
      case 1:
        return {
          name: this.facilityForm.value.name,
          email: this.facilityForm.value.email || null,
          address: this.facilityForm.value.address,
          phone: this.facilityForm.value.phone.internationalNumber,
          notes: this.facilityForm.value.notes,
          taxRegistrationNumber: this.facilityForm.value.taxRegistrationNumber,
          commercialRegistrationNumber:
            this.facilityForm.value.commercialRegistrationNumber,
          type: ClientType.Facility,
          isVIB: this.facilityForm.value.isVIB || false,
          hallId: this.hallsService.getCurrentHall()?.id,
          contacts:
            !this.client?.id &&
            this.facilityForm?.get('contacts')?.value?.length === 0
              ? null
              : this.facilityForm.get('contacts')?.value?.map((ele: any) => {
                  return {
                    name: ele?.name,
                    email: ele?.email,
                    phone: ele?.phone.internationalNumber,
                  };
                }),
        };
      default:
        return {
          name: this.governmentFacilityForm.value.name,
          email: this.governmentFacilityForm.value.email || null,
          phone: this.governmentFacilityForm.value.phone.internationalNumber,
          notes: this.governmentFacilityForm.value.notes,
          type: ClientType.Governmental,
          isVIB: this.governmentFacilityForm.value.isVIB || false,
          address: this.governmentFacilityForm.value.address,
          hallId: this.hallsService.getCurrentHall()?.id,
          contacts:
            !this.client?.id &&
            this.governmentFacilityForm?.get('contacts')?.value?.length === 0
              ? null
              : this.governmentFacilityForm
                  .get('contacts')
                  ?.value?.map((ele: any) => {
                    return {
                      name: ele?.name,
                      email: ele?.email,
                      phone: ele?.phone.internationalNumber,
                    };
                  }),
        };
    }
  }

  submit() {
    const currentHall = this.hallsService.getCurrentHall();
    if (!currentHall) return;

    const isEditMode = this.client && this.mode === 'edit';
    const isUpsertMode = this.client && this.mode === 'add';

    const formValue = this.createRequestData();

    const req$ = isEditMode
      ? this.clientsService.updateClient(this.client?.id!, formValue as Client)
      : isUpsertMode
        ? this.clientsService.getClientFromAnotherHall(
            this.client?.id!,
            formValue as Client,
          )
        : this.clientsService.createNewClient(formValue as Client);

    const sub = req$.subscribe((response) => {
      this.drawerService.drawerState.next({
        visible: false,
        mode: 'add',
        title: '',
        onCloseData: response,
        submitButtonText: 'common.save',
        submitButtonIcon: 'pi pi-save',
      });

      this.refreshDataTable.emit();
      this.drawerService.close();
    });
  }

  addNewContact(FormArray: FormArray) {
    const newContact = this.fb.group({
      name: [
        '',
        [Validators.required, noDoubleSpaceValidator(), validateDoubleName()],
      ],
      phone: ['', Validators.required],
      email: ['', Validators.email],
    });
    FormArray?.push(newContact);
  }

  removeContact(index: number, FormArray: FormArray) {
    FormArray.removeAt(index);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

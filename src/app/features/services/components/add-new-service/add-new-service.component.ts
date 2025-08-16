import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';

import {FormMode} from '@core/models';
import {extractNationalPhoneNumber} from '@core/utils';
import {Hall} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {requireOneOf} from '@core/validators';
import {costLessThanPriceValidator} from '@services/validators/cost-less-than-price.validator';
import {ProviderDetails, ProviderType, Service} from '@services/models';
import {ServicesService} from '@services/services/services.service';
import {Supplier} from '@suppliers/models/supplier';
import {SuppliersService} from '@suppliers/services/suppliers.service';
import {AuthService} from '@core/services';
import {PermissionTypes} from '@auth/models';

@Component({
  selector: 'app-add-new-service',
  templateUrl: './add-new-service.component.html',
  styleUrl: './add-new-service.component.scss',
  standalone: false,
})
export class AddNewServiceComponent implements OnInit, OnDestroy {
  service!: Service;
  mode: FormMode = 'add';

  halls: Hall[] | null = [];
  suppliers: Supplier[] = [];
  currentAvailableSuppliers: Supplier[] = [];

  currentHall: Hall | null = null;
  suppliersLoaded = false;

  showProviders = false;
  showSuppliers = false;

  providerTypeOptions: {value: ProviderType; label: string}[] = [];
  supplierViewControl = new FormControl({value: '', disabled: true});
  providerTypeViewControl = new FormControl({value: '', disabled: true});

  subs = new Subscription();

  serviceForm: FormGroup = this.fb.group(
    {
      name: ['', Validators.required],
      name_ar: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      cost: ['', [Validators.required, Validators.min(0)]],
      note: [''],
      providerType: [ProviderType.HALL, Validators.required],
      supplier: [null],
      providers: this.fb.array([]),
    },
    {
      validators: [
        costLessThanPriceValidator,
        requireOneOf(['name', 'name_ar']),
      ],
    },
  );

  get serviceNameControl() {
    return this.serviceForm.get('name') as FormControl;
  }
  get serviceNameArControl() {
    return this.serviceForm.get('name_ar') as FormControl;
  }
  get priceControl() {
    return this.serviceForm.get('price') as FormControl;
  }
  get costControl() {
    return this.serviceForm.get('cost') as FormControl;
  }
  get noteControl() {
    return this.serviceForm.get('note') as FormControl;
  }

  get providerTypeControl() {
    return this.serviceForm.get('providerType') as FormControl;
  }
  get supplierIdControl() {
    return this.serviceForm.get('supplier') as FormControl;
  }
  get providersControls() {
    return this.serviceForm.get('providers') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private servicesService: ServicesService,
    private hallsService: HallsService,
    private suppliersService: SuppliersService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.updateProviderTypeOptions();

    const langSub = this.translate.onLangChange.subscribe(() =>
      this.updateProviderTypeOptions(),
    );
    this.subs.add(langSub);

    this.route.data.subscribe((d) => {
      this.mode = d['mode'];
      this.service = d['service'];
    });

    const hallSub = this.hallsService.currentHall$.subscribe((hall) => {
      this.currentHall = hall;
      if (!hall) {
        return;
      }

      this.subs.add(
        this.servicesService
          .getHalls()
          .subscribe((h) => (this.halls = h.items)),
      );

      if (this.mode !== 'view') {
        this.subs.add(
          this.suppliersService
            .getSuppliers({hallId: hall.id, active: true})
            .subscribe((resp) => {
              this.suppliers = resp.items;

              this.currentAvailableSuppliers =
                this.filterSupplierBasedOnPermission(resp.items);
              this.suppliersLoaded = true;

              if (this.mode !== 'add' && this.service) {
                this.populateServiceForm();
              }
            }),
        );
      } else {
        this.populateServiceForm();
      }
    });
    this.subs.add(hallSub);

    this.serviceProviderListener();
  }

  filterSupplierBasedOnPermission(suppliers: Supplier[]) {
    const user = this.authService.userData?.user;

    if (user?.permissionType === PermissionTypes.GENERAL) return suppliers;

    return suppliers.filter((supplier) => supplier.created_by === user?.userId);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private getProviderTypeLabel(value: ProviderType): string {
    const opt = this.providerTypeOptions.find((o) => o.value === value);
    return opt ? opt.label : value;
  }

  private t(key: string, fallback: string): string {
    const txt = this.translate.instant(key);

    return !txt || txt === key || !txt.trim() ? fallback : txt;
  }

  private updateProviderTypeOptions(): void {
    this.providerTypeOptions = [
      {
        value: ProviderType.HALL,
        label: this.t(
          'services.hallName',
          this.translate.currentLang === 'ar' ? 'القاعة' : 'Hall',
        ),
      },
      {
        value: ProviderType.THIRD_PARTY,
        label: this.t(
          'services.thirdParty',
          this.translate.currentLang === 'ar' ? 'طرف ثالث' : 'Third‑party',
        ),
      },
      {
        value: ProviderType.SUPPLIER,
        label: this.t(
          'services.supplier',
          this.translate.currentLang === 'ar' ? 'مورد' : 'Supplier',
        ),
      },
    ];
  }

  private populateServiceForm(): void {
    if (!this.service?.halls?.length) {
      return;
    }

    const hall = this.service.halls[0];

    this.serviceForm.patchValue(
      {
        name: this.service.name,
        name_ar: this.service.name_ar,
        price: hall.price,
        cost: hall.cost,
        note: this.service.note,
        providerType: hall.providerType,
      },
      {emitEvent: false},
    );

    if (hall.providerType === ProviderType.THIRD_PARTY) {
      this.showProviders = true;
      this.providersControls.clear();
      if (hall.providers) {
        this.populateThirdPartyArray(hall.providers);
      }
    } else if (hall.providerType === ProviderType.SUPPLIER) {
      this.showSuppliers = true;

      const supplierData: any = hall.supplier;
      if (supplierData) {
        const id =
          typeof supplierData === 'object' && 'id' in supplierData
            ? supplierData.id
            : supplierData;
        this.supplierIdControl.setValue(id, {emitEvent: false});
      }

      if (this.mode === 'view') {
        this.supplierViewControl.setValue(
          this.service.halls[0].supplier?.name!,
        );
      }
    }

    if (this.mode === 'view') {
      this.providerTypeViewControl.setValue(
        this.getProviderTypeLabel(hall.providerType),
        {emitEvent: false},
      );

      this.serviceForm.markAsPristine();
      [
        'name',
        'name_ar',
        'price',
        'cost',
        'note',
        'providerType',
        'supplier',
      ].forEach((c) => this.serviceForm.get(c)?.disable());
      this.providersControls.disable();
    }
  }

  private populateThirdPartyArray(providers: ProviderDetails[]): void {
    providers.forEach((p) => {
      this.providersControls.push(
        this.fb.group({
          name: [p.name, Validators.required],
          email: [p.email],
          phone: [
            extractNationalPhoneNumber(p.phone as unknown as string),
            Validators.required,
          ],
          originalPhone: [p.phone], // helper field to store original phone number
        }),
      );
    });
    if (this.mode === 'view') {
      this.providersControls.disable();
    }
  }

  private serviceProviderListener(): void {
    this.providerTypeControl.valueChanges.subscribe((v) => {
      if (this.mode === 'view') {
        return;
      }

      this.showProviders = false;
      this.showSuppliers = false;
      this.providersControls.clear();
      this.supplierIdControl.setValue(null);

      if (v === ProviderType.THIRD_PARTY) {
        this.showProviders = true;
        this.addThirdParty();
        this.supplierIdControl.clearValidators();
      } else if (v === ProviderType.SUPPLIER) {
        this.showSuppliers = true;
        this.supplierIdControl.setValidators(Validators.required);
      } else {
        this.supplierIdControl.clearValidators();
      }
      this.supplierIdControl.updateValueAndValidity();
    });
  }

  addThirdParty(): void {
    this.providersControls.push(
      this.fb.group({
        name: ['', Validators.required],
        email: [null],
        phone: [null as string | null, Validators.required],
        originalPhone: [null], // helper field to store original phone number
      }),
    );
  }

  deleteThirdParty(i: number): void {
    if (this.providersControls.length > 1) {
      this.providersControls.removeAt(i);
    }
  }

  getControl(name: string, parent: AbstractControl): FormControl {
    return parent.get(name) as FormControl;
  }

  submit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      this.serviceForm.updateValueAndValidity();
      return;
    }
    this.mode === 'add' ? this.addNewService() : this.updateService();
  }

  private createServiceData() {
    if (!this.currentHall) {
      return null;
    }

    const hallData: any = {
      id: this.currentHall.id,
      price: +this.priceControl.value,
      cost: +this.costControl.value,
      providerType: this.providerTypeControl.value,
    };

    if (this.providerTypeControl.value === ProviderType.THIRD_PARTY) {
      hallData.providers = this.providersControls.value.map(
        (p: ProviderDetails) => ({
          name: p.name,
          email: p.email,
          phone: p.phone['e164Number'],
        }),
      );
    } else if (this.providerTypeControl.value === ProviderType.SUPPLIER) {
      hallData.supplier = this.supplierIdControl.value;
    } else {
      hallData.providers = [];
    }

    return {
      name: this.serviceNameControl.value,
      name_ar: this.serviceNameArControl.value,
      note: this.noteControl.value,
      halls: [hallData],
    };
  }

  private addNewService(): void {
    const payload = this.createServiceData();
    if (!payload) {
      return;
    }

    this.servicesService
      .addNewService(payload)
      .subscribe(() => this.router.navigate(['/services']));
  }

  private updateService(): void {
    const payload = this.createServiceData();
    if (!payload) {
      return;
    }

    this.servicesService
      .updateService(this.service.id, payload)
      .subscribe(() => this.router.navigate(['/services']));
  }

  navigateToUpdate(): void {
    this.router.navigate(['/services', 'edit', this.service.id]);
  }
  cancel(): void {
    this.router.navigate(['/services']);
  }

  private getSupplierName(obj: any): string {
    if (!obj) {
      return '-';
    }

    const id = typeof obj === 'object' && obj.id ? obj.id : obj;
    const byId = this.suppliers.find((s) => s.id == id);
    return byId ? byId.name : `Supplier #${id}`;
  }
}

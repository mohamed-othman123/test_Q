import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {OrganizationInfo} from '@organization-info/model/organization-info';
import {OrganizationInfoService} from '@organization-info/services/organization-info.service';
import {AuthService} from '@core/services';
import {ZatcaService} from '@organization-info/services/zatca.service';
import {Address} from '@core/interfaces/address';

@Component({
  selector: 'app-organization-info',
  templateUrl: './organization-info.component.html',
  styleUrl: './organization-info.component.scss',
  standalone: false,
})
export class OrganizationInfoComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  organizationInfoData!: OrganizationInfo;
  showOtp: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private organizationInfo: OrganizationInfoService,
    private authService: AuthService,
    private zatcaService: ZatcaService,
  ) {}

  ngOnInit(): void {
    this.organizationInfo.getOrganizationInfo().subscribe((data) => {
      this.organizationInfoData = data;
      this.initForm(data);

      this.trackOrganizationEntry(data);
    });
  }

  initForm(data: OrganizationInfo) {
    this.form = this.fb.group({
      name: [data.name, Validators.required],
      phone: [data.phone, Validators.required],
      taxRegistrationNumber: [
        data.taxRegistrationNumber,
        [
          Validators.required,
          Validators.minLength(15),
          Validators.maxLength(15),
          Validators.pattern(/^[1-9]\d{14}$/),
        ],
      ],
      commercialRegistrationNumber: [
        data.commercialRegistrationNumber,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern(/^[1-9]\d{9}$/),
        ],
      ],
      category: [data.category, Validators.required],
      address: this.createAddressForm(data.address),
    });
  }

  createAddressForm(data: Address): FormGroup {
    return this.fb.group({
      city: [data.city, [Validators.required]],
      district: [data.district, [Validators.required]],
      street: [data.street, [Validators.required]],
      buildingNumber: [data.buildingNumber, [Validators.required]],
      unitNumber: [data.unitNumber],
      additionalNumber: [data.additionalNumber],
      postalCode: [
        data.postalCode,
        [Validators.required, Validators.minLength(5), Validators.maxLength(5)],
      ],
    });
  }

  getControl(controlName: string) {
    return this.form?.get(controlName) as FormControl;
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();

      return;
    }

    const phone = this.getControl('phone').value.internationalNumber;

    this.organizationInfo
      .updateOrganizationInfo({...this.form.value, phone})
      .subscribe({
        next: (data) => {
          this.initForm(data);
          this.toggleEditMode();
        },
      });
  }

  verifyOtp(otp: string) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.zatcaService.integrate(otp).subscribe({
      next: (_) => {
        this.organizationInfoData.isZatcaConnected = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }

  hideOtpDialog() {
    this.showOtp = false;
  }

  connectToZatca() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.showOtp = true;
  }

  private trackOrganizationEntry(data: OrganizationInfo): void {
    const userData = this.authService.userData;
  }

  private getOrganizationId(): string {
    return (
      (this.organizationInfoData as any).id ||
      this.organizationInfoData.commercialRegistrationNumber ||
      'org_unknown'
    );
  }
}

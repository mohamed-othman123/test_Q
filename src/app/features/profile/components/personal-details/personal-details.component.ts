import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '@core/services/auth.service';
import {ProfileService} from '@profile/services/profile.service';
import {noDoubleSpaceValidator} from '@core/validators';

@Component({
    selector: 'app-personal-details',
    templateUrl: './personal-details.component.html',
    styleUrls: ['./personal-details.component.scss'],
    standalone: false
})
export class PersonalDetailsComponent implements OnInit {
  profileForm!: FormGroup;
  isEditMode = false;
  profileData: any;
  formattedPhoneNumber: string = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
  ) {
    this.initForm();
  }

  private initForm() {
    this.profileForm = this.fb.group({
      name: new FormControl('', [
        Validators.required,
        noDoubleSpaceValidator(),
      ]),
      email: new FormControl(''),
      phone: new FormControl(null),
      password: new FormControl(''),
      active: new FormControl(true),
    });
  }

  ngOnInit() {
    this.loadUserProfile();
    this.profileForm.get('phone')?.valueChanges.subscribe((value) => {
      if (value && typeof value === 'object') {
        this.formattedPhoneNumber = value.e164Number;
      }
    });
  }

  get formControls() {
    return {
      name: this.profileForm.get('name') as FormControl,
      email: this.profileForm.get('email') as FormControl,
      phone: this.profileForm.get('phone') as FormControl,
      password: this.profileForm.get('password') as FormControl,
      active: this.profileForm.get('active') as FormControl,
    };
  }

  toggleEditMode() {
    this.formControls.phone.reset();
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.loadUserProfile();
    }
  }

  loadUserProfile() {
    const profileId = this.authService.userData?.user?.userId;
    if (profileId) {
      this.profileService.getProfile().subscribe({
        next: (profile) => {
          this.profileData = profile;
          this.formattedPhoneNumber = profile.phone;
          this.profileForm.patchValue({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            active: profile.active,
          });
        },
      });
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const profileId = this.authService.userData?.user?.userId;
      if (profileId) {
        const formData = this.profileForm.value;
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone.internationalNumber,
          password: formData.password || undefined,
          active: formData.active,
        };

        this.profileService.updateProfile(updateData).subscribe({
          next: () => {
            this.isEditMode = false;
            this.loadUserProfile();
          },
        });
      }
    }
  }
}

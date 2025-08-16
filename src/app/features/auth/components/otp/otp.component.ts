import {Component, OnDestroy} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {OtpData, verifyOtpBody} from '@auth/models';
import {OtpChannels, StorageKeys} from '@core/enums';
import {AuthService} from '@core/services';
import {Subscription, switchMap} from 'rxjs';
import {HallsService} from '@halls/services/halls.service';
import {NavigationService} from '@core/services/navigation.service';

@Component({
    selector: 'app-otp',
    templateUrl: './otp.component.html',
    styleUrls: ['./otp.component.scss'],
    standalone: false
})
export class OtpComponent implements OnDestroy {
  form = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(4)]],
  });
  mobileMasked: string = '';
  otp!: string;
  subs = new Subscription();
  email!: string;
  channel!: OtpChannels;
  other: any;
  otpAttempts: number = 0;

  constructor(
    private readonly fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private hallsService: HallsService,
    private route: ActivatedRoute,
    private navigationService: NavigationService,
  ) {
    const state = router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.email = state?.['email'];
      this.channel = state?.['channel'];
      this.other = state?.['other'];
      sessionStorage.setItem(StorageKeys.OTP_DATA, JSON.stringify(state));
    } else {
      const otpData = JSON.parse(
        sessionStorage.getItem(StorageKeys.OTP_DATA)!,
      ) as OtpData;
      if (otpData) {
        this.email = otpData.email;
        this.channel = otpData.channel;
        this.other = otpData.other;
      } else {
        router.navigate(['../login'], {relativeTo: route});
      }
    }
  }

  get formControls() {
    return this.form.controls;
  }

  onSubmit() {
    this.otpAttempts++;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();

      return;
    } else {
      this.handleOtpVerification();
    }
  }

  handleOtpVerification() {
    let body: verifyOtpBody;
    switch (this.channel) {
      case OtpChannels.LOGIN:
      case OtpChannels.REGISTRATION:
        body = {
          channel: this.channel,
          otp: parseInt(this.formControls.otp.value!),
          userId: this.other.userId,
          isRememberMe:
            localStorage.getItem(StorageKeys.REMEMBER_ME) === 'true',
        };

        this.authService
          .verifyOtp(body)
          .pipe(
            switchMap((verifyResponse) => {
              return this.hallsService.initializeHalls();
            }),
          )
          .subscribe({
            next: (hallsResponse) => {
              const hallCount = hallsResponse.items.length;

              let page: string = this.navigationService.getFirstAccessibleRoute(
                this.authService.userData?.user.role.permissions!,
              );

              if (hallCount === 0) {
                page = 'halls';
              }

              this.router.navigate([page]);
            },
          });
        break;
      default:
        sessionStorage.removeItem(StorageKeys.OTP_DATA);
        break;
    }
  }

  onOtpChange(otp: string) {
    this.form.controls.otp.setValue(otp);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    sessionStorage.removeItem(StorageKeys.OTP_DATA);
  }
}

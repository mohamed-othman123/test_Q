import {Component} from '@angular/core';
import {NonNullableFormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {OtpChannels} from '@core/enums';
import {AuthService} from '@core/services';
import {
  noDoubleSpaceValidator,
  passwordValidator,
  validateDoubleName,
} from '@core/validators';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.scss',
    standalone: false
})
export class SignupComponent {
  form = this.fb.group({
    name: [
      '',
      {
        validators: [
          Validators.required,
          validateDoubleName(),
          noDoubleSpaceValidator(),
        ],
      },
    ],
    email: ['', {validators: [Validators.required, Validators.email]}],
    password: ['', {validators: [Validators.required, passwordValidator()]}],
  });

  constructor(
    private fb: NonNullableFormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  get passwordToolTipText() {
    return this.form.controls.password.hasError('weakPassword')
      ? 'errors.weakPasswordTip'
      : '';
  }

  signup() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      return;
    }
    if (this.form.valid) {
      this.auth.signUp(this.form.getRawValue()).subscribe((signUpRes) => {
        this.router.navigate(['../otp'], {
          relativeTo: this.route,
          state: {
            email: this.form.value.email,
            other: signUpRes,
            channel: OtpChannels.REGISTRATION,
          },
        });
      });
    }
  }
}

import {Component} from '@angular/core';
import {NonNullableFormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {OtpChannels} from '@core/enums';
import {AuthService} from '@core/services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent {
  form = this.fb.group({
    email: [
      '',
      {
        validators: [Validators.required, Validators.email],
      },
    ],
    password: ['', {validators: [Validators.required]}],
    rememberMe: [false],
  });

  constructor(
    private fb: NonNullableFormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();

      return;
    }

    if (this.form.valid) {
      const email = this.form.controls.email.value.toLowerCase();
      const password = this.form.controls.password.value;
      const rememberMe = this.form.controls.rememberMe.value;

      this.authService.login(email, password, rememberMe).subscribe({
        next: (signUpRes) => {
          this.router.navigate(['../otp'], {
            relativeTo: this.route,
            state: {
              email: this.form.value.email,
              other: signUpRes,
              channel: OtpChannels.LOGIN,
            },
          });
        },
        error: (error) => {},
      });
    }
  }

  onForgotPasswordClick() {}
}

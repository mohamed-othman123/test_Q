import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ResetPassword} from '@auth/models';
import {AuthService, NotificationService} from '@core/services';
import {tap} from 'rxjs';
import {passwordValidator} from '@core/validators';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss',
    standalone: false
})
export class ResetPasswordComponent implements OnInit {
  userToken: string = '';
  form = this.fb.group({
    password: ['', {validators: [Validators.required, passwordValidator()]}],
    confirmedPassword: ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.userToken = params['token'];
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();

      return;
    }

    if (this.form.valid) {
      const password = this.form.controls.password.value;
      const confirmedPassword = this.form.controls.confirmedPassword.value;

      if (password !== confirmedPassword) {
        return;
      }

      const payload: ResetPassword = {password, confirmedPassword};

      this.authService
        .resetPassword(this.userToken, payload)
        .pipe(
          tap(() => {
            this.notificationService.showSuccess('auth.password_reset_success');
          }),
        )
        .subscribe({
          next: (res) => {
            this.router.navigate(['auth/login']);
          },
        });
    }
  }
}

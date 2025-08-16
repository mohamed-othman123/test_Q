import {Component} from '@angular/core';
import {Validators, FormBuilder} from '@angular/forms';
import {Router} from '@angular/router';
import {
  AuthService,
  LanguageService,
  NotificationService,
} from '@core/services';
import {ModalService} from '@core/services/modal/modal.service';
import {tap} from 'rxjs';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    standalone: false
})
export class ForgotPasswordComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public modalService: ModalService,
    private router: Router,
    private notificationService: NotificationService,
    public lang: LanguageService,
  ) {}

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
      const email = this.form.controls.email.value;
      if (email) {
        const emailObject = {email};
        this.authService
          .forgetPassword(emailObject)
          .pipe(
            tap(() =>
              this.notificationService.showSuccess(
                'auth.password_reset_email_sent',
              ),
            ),
          )
          .subscribe((res) => {
            this.router.navigate(['/auth/login']);
          });
      }
    }
  }

  closeSendResetPasswordModal() {
    this.form.reset();
  }
}

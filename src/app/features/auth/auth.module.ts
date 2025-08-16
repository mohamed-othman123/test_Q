import {NgModule} from '@angular/core';
import {AuthRoutingModule} from './auth-routing.module';
import {LoginComponent} from './components/login/login.component';
import {SharedModule} from '@shared/shared.module';
import {CheckboxModule} from 'primeng/checkbox';
import {SignupComponent} from './components/signup/signup.component';
import {TranslateModule} from '@ngx-translate/core';
import {AuthComponent} from './pages/auth.component';
import {OtpComponent} from './components/otp/otp.component';
import {CountdownTimerComponent} from './components/otp/countdown-timer/countdown-timer.component';
import {NgOtpInputModule} from 'ng-otp-input';
import {ForgotPasswordComponent} from './components/forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './components/reset-password/reset-password.component';

@NgModule({
  declarations: [
    AuthComponent,
    LoginComponent,
    SignupComponent,
    OtpComponent,
    CountdownTimerComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
  ],
  imports: [
    AuthRoutingModule,
    SharedModule,
    CheckboxModule,
    TranslateModule,
    NgOtpInputModule,
  ],
})
export class AuthModule {}

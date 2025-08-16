import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {SignupComponent} from './components/signup/signup.component';
import {AuthComponent} from './pages/auth.component';
import {OtpComponent} from './components/otp/otp.component';
import {ForgotPasswordComponent} from './components/forgot-password/forgot-password.component';
import {loginGuard} from '@core/guards';
import {ResetPasswordComponent} from './components/reset-password/reset-password.component';

const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {path: '', redirectTo: 'login', pathMatch: 'full'},
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [loginGuard],
      },
      // {
      //   path: 'signup',
      //   component: SignupComponent,
      //   canActivate: [loginGuard],
      // },
      {
        path: 'otp',
        component: OtpComponent,
      },
      {
        path: 'forget-password',
        component: ForgotPasswordComponent,
        canActivate: [loginGuard],
      },
      {
        path: 'reset-password/:token',
        component: ResetPasswordComponent,
        canActivate: [loginGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}

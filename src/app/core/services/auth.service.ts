import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {StorageKeys} from '../enums';
import {
  BehaviorSubject,
  Observable,
  map,
  noop,
  tap,
  catchError,
  Subject,
} from 'rxjs';
import {
  ForgetPasswordResponse,
  LoginResponse,
  ResetPassword,
  ResetPasswordResponse,
  SignUpBody,
  SignUpResponse,
  UserData,
  verifyOtpBody,
  VerifyOtpResponse,
} from '@auth/models';
import {ApiConfigService} from './api-config.service';
import HyperDX from '@hyperdx/browser';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  module = 'auth';
  apiAuthUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  private userSubject: BehaviorSubject<UserData | null>;
  public user$: Observable<UserData | null>;
  private refreshTokenTimeout!: any;
  private logoutTimer!: any;

  loggedIn = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
    private router: Router,
  ) {
    this.userSubject = new BehaviorSubject(
      JSON.parse(this.storage.getItem(StorageKeys.USER_DATA)!),
    );
    this.user$ = this.userSubject.asObservable();
  }

  public get userData(): UserData | null {
    return this.userSubject.value;
  }

  public get isLoggedIn(): boolean {
    return !!this.userData?.token;
  }

  get storage(): Storage {
    return localStorage.getItem(StorageKeys.REMEMBER_ME) === 'true'
      ? localStorage
      : sessionStorage;
  }

  login(email: string, password: string, rememberMe: boolean = false) {
    return this.http
      .post<LoginResponse>(`${this.apiAuthUrl}/login`, {
        email,
        password,
      })
      .pipe(
        tap(() => {
          localStorage.setItem(StorageKeys.REMEMBER_ME, rememberMe.toString());
        }),
        catchError((error) => {
          HyperDX.recordException(error, {context: 'login_request_failed'});
          throw error;
        }),
      );
  }
  signUp(body: SignUpBody) {
    const url = `${this.apiAuthUrl}/register`;
    return this.http.post<SignUpResponse>(url, body);
  }

  verifyOtp(body: verifyOtpBody) {
    const url = `${this.apiAuthUrl}/verifyOtp`;
    return this.http.post<VerifyOtpResponse>(url, body).pipe(
      tap((res) => {
        this.storage.setItem(StorageKeys.USER_DATA, JSON.stringify(res));
        this.userSubject.next(res);
        this.loggedIn.next(true);

        HyperDX.setGlobalAttributes({
          userId: String(res.user.userId),
          userEmail: res.user.email,
          userName: res.user.name ?? res.user.email,
          role: res.user.role.name,
          clientId: String(res.user.clientId),
          userType: res.user.type,
          permissionType: res.user.permissionType,
        });

        if (this.storage === sessionStorage) {
          this.startLogoutTimer(res.token);
        }
        if (this.storage === localStorage) {
          this.startRefreshTokenTimer();
        }
      }),
    );
  }

  resendOtp(email: string) {
    const url = `${this.apiAuthUrl}/resendOtp`;
    return this.http.post(url, {email});
  }

  logout() {
    const currentUser = this.userData;

    // Clear both storages to be safe
    localStorage.removeItem(StorageKeys.USER_DATA);
    sessionStorage.removeItem(StorageKeys.USER_DATA);

    localStorage.removeItem('login_timestamp');
    sessionStorage.removeItem('login_timestamp');

    this.stopRefreshTokenTimer();
    this.stopLogoutTimer();
    this.userSubject.next(null);

    HyperDX.setGlobalAttributes({});

    this.router.navigate(['auth/login']);
  }

  refreshToken() {
    return this.http
      .post<UserData>(`${this.apiAuthUrl}/refreshToken`, {
        rToken: this.userData!.refresh_token,
      })
      .pipe(
        map((user) => {
          this.storage.setItem(StorageKeys.USER_DATA, JSON.stringify(user));
          this.userSubject.next(user);
          this.startRefreshTokenTimer();

          return user;
        }),
        catchError((error) => {
          if (
            error.status === 400 ||
            error.status === 401 ||
            error.status === 403
          ) {
            this.logout();
          }
          throw error;
        }),
      );
  }

  private startRefreshTokenTimer() {
    // parse json object from base64 encoded jwt token
    const jwtBase64 = this.userData!.refresh_token!.split('.')[1];

    const decodedJwtToken = this.urlBase64Decode(jwtBase64);
    const jwtToken = JSON.parse(decodedJwtToken);

    // set a timeout to refresh the token a minute before it expires
    const expires = new Date(jwtToken.exp * 1000);

    const timeout = expires.getTime() - Date.now() - 60 * 1000;

    if (timeout <= 0) {
      this.logout();
      return;
    }

    this.refreshTokenTimeout = setTimeout(
      () => this.refreshToken().subscribe(noop),
      timeout,
    );
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }

  startLogoutTimer(token: string) {
    const tokenExpiration = this.getTokenExpiration(token);
    const timeout = tokenExpiration - Date.now();

    if (timeout > 0) {
      this.logoutTimer = setTimeout(() => {
        this.logout();
      }, timeout);
    }
  }

  private stopLogoutTimer() {
    clearTimeout(this.logoutTimer);
  }

  forgetPassword(body: {email: string}) {
    const url = `${this.apiAuthUrl}/forgotpassword`;
    return this.http.patch<ForgetPasswordResponse>(url, body);
  }

  resetPassword(token: string, body: ResetPassword) {
    const url = `${this.apiAuthUrl}/reset-password/${token}`;
    return this.http.patch<ResetPasswordResponse>(url, body);
  }

  private getTokenExpiration(token: string): number {
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(this.urlBase64Decode(payloadBase64));
      return payload.exp * 1000;
    } catch (error) {
      console.error('Error decoding token', error);
      // Fallback to immediate expiration
      return Date.now();
    }
  }

  // Converts URL-safe Base64 to standard Base64 and decodes it
  private urlBase64Decode(str: string): string {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '=' characters until the string length is a multiple of 4
    while (output.length % 4 !== 0) {
      output += '=';
    }
    return atob(output);
  }

  private getSessionDuration(): number {
    const loginTime =
      sessionStorage.getItem('login_timestamp') ||
      localStorage.getItem('login_timestamp');
    if (loginTime) {
      return Date.now() - parseInt(loginTime);
    }
    return 0;
  }
}

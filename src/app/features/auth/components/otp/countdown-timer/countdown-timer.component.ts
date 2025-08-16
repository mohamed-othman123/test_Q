import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {noop, Subscription, tap} from 'rxjs';
import { NgClass } from '@angular/common';
import {AuthService, NotificationService} from '@core/services';
import {OtpData} from '@auth/models';
import {StorageKeys} from '@core/enums';

@Component({
    selector: 'app-countdown-timer',
    templateUrl: './countdown-timer.component.html',
    styleUrl: './countdown-timer.component.scss',
    standalone: false
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  isCounterVisible: boolean = true;
  showResendOtpBtn = false;
  timeLimit = 120;
  timePassed = 0;
  timeLeft = this.timeLimit;
  timerInterval!: number | any;
  circleDasharray: string = '';
  remainingPathColor = 'green';

  colorCodes = {
    info: {color: 'green'},
    warning: {color: 'orange', threshold: 30},
    alert: {color: 'red', threshold: 10},
  };
  subs = new Subscription();

  constructor(
    private _cdr: ChangeDetectorRef,
    private auth: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.resetTimer();
    this.startTimer();
  }

  startTimer(): void {
    this.isCounterVisible = true;
    this.timerInterval = setInterval(() => {
      this.timePassed += 1;
      this.timeLeft = this.timeLimit - this.timePassed;

      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.onTimesUp();
        this.isCounterVisible = false;
      } else {
        this.setCircleDasharray();
        this.setRemainingPathColor();
      }
      this._cdr.detectChanges();
    }, 1000);
  }

  onTimesUp(): void {
    clearInterval(this.timerInterval);
    this.isCounterVisible = false;
    this.showResendOtpBtn = true;
  }

  resetTimer(): void {
    clearInterval(this.timerInterval);
    this.timePassed = 0;
    this.timeLeft = this.timeLimit;
    this.showResendOtpBtn = false;
    this.setCircleDasharray();
    this.setRemainingPathColor();
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    let seconds: string | number = time % 60;

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }

  setRemainingPathColor(): void {
    const {alert, warning, info} = this.colorCodes;

    if (this.timeLeft <= alert.threshold) {
      this.remainingPathColor = alert.color;
    } else if (this.timeLeft <= warning.threshold) {
      this.remainingPathColor = warning.color;
    } else {
      this.remainingPathColor = info.color;
    }
  }

  calculateTimeFraction(): number {
    const rawTimeFraction = this.timeLeft / this.timeLimit;
    return rawTimeFraction - (1 / this.timeLimit) * (1 - rawTimeFraction);
  }

  setCircleDasharray(): void {
    this.circleDasharray = `${(this.calculateTimeFraction() * 283).toFixed(0)} 283`;
  }

  resendOtp() {
    const otpData = JSON.parse(
      sessionStorage.getItem(StorageKeys.OTP_DATA)!,
    ) as OtpData;
    const sub = this.auth
      .resendOtp(otpData.email)
      .pipe(tap(() => this.notificationService.showSuccess('auth.otp_sent')))
      .subscribe(() => {
        this.resetTimer();
        this.startTimer();
      });
    this.subs.add(sub);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
    this.subs.unsubscribe();
  }
}

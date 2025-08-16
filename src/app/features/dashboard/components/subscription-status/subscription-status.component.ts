import {Component, Input, OnInit} from '@angular/core';
import {AuthService, LanguageService} from '@core/services';
import {differenceInCalendarDays} from 'date-fns';

@Component({
    selector: 'app-subscription-status',
    templateUrl: './subscription-status.component.html',
    styleUrl: './subscription-status.component.scss',
    standalone: false
})
export class SubscriptionStatusComponent implements OnInit {
  supportPhone!: string | null;
  superscribed = true;

  daysRemaining!: number;
  totalDays!: number;
  daysConsumed!: number;
  percent!: string;
  severity: 'success' | 'warning' | 'danger' = 'success';
  iconClass!: string;
  messageKey!: string;
  expiredSince!: number;

  readMore = false;

  constructor(
    private authService: AuthService,
    public lang: LanguageService,
  ) {}

  ngOnInit(): void {
    this.supportPhone = this.authService.userData?.support?.phone as string;

    const subscription = this.authService.userData?.user?.subscription;

    if (!subscription || !subscription.endDate || !subscription.startDate) {
      this.superscribed = false;
      return;
    }

    const start = new Date(subscription?.startDate);
    const end = new Date(subscription?.endDate);

    // const start = new Date('2025-07-07T14:00:00Z');
    // const end = new Date('2025-07-20T14:00:00Z');

    const today = new Date();

    this.totalDays = Math.max(differenceInCalendarDays(end, start), 1);

    const different = differenceInCalendarDays(end, today);

    this.daysRemaining = different < 0 ? 0 : different;
    this.daysConsumed = this.totalDays - this.daysRemaining;

    this.expiredSince = different * -1;

    this.percent = Math.min(
      Math.max(
        ((this.totalDays - this.daysRemaining) / this.totalDays) * 100,
        0,
      ),
      100,
    ).toFixed();

    if (this.daysRemaining <= 0) {
      this.severity = 'danger';
      this.iconClass = 'pi pi-exclamation-triangle';
      this.messageKey = 'dashboard.subscription.expired';
    } else if (this.daysRemaining <= 7) {
      this.severity = 'warning';
      this.iconClass = 'pi pi-exclamation-circle';
      this.messageKey = 'dashboard.subscription.active';
    } else {
      this.severity = 'warning';
      this.iconClass = 'pi pi-bell';
      this.messageKey = 'dashboard.subscription.active';
    }
  }
}

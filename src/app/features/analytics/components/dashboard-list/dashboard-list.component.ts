import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {AIAnalyticsService, Dashboard} from '../../a-i-analytics.service';

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.scss'],
  standalone: false
})
export class DashboardListComponent implements OnInit, OnDestroy {
  dashboards: Dashboard[] = [];
  loading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AIAnalyticsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboards();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboards(): void {
    this.loading = true;
    this.error = null;

    this.analyticsService.getAvailableDashboards()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dashboards) => {
          this.dashboards = dashboards;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load dashboards. Please try again.';
          this.loading = false;
        }
      });
  }

  onDashboardClick(dashboard: Dashboard): void {
    console.log('🎯 Dashboard clicked:', dashboard);
    this.router.navigate(['/analytics/dashboard', dashboard.id]);
  }

  onRetry(): void {
    this.loadDashboards();
  }

  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }
}

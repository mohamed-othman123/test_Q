import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  AIAnalyticsService
} from '../../a-i-analytics.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Dashboard } from '../../models/analytics.model';

export interface DashboardWithQuestions extends Dashboard {
  isExpanded?: boolean;
}

@Component({
  selector: 'app-analytics-overview',
  templateUrl: './analytics-overview.component.html',
  styleUrls: ['./analytics-overview.component.scss'],
  standalone: false,
})
export class AnalyticsOverviewComponent implements OnInit, OnDestroy {
  dashboardsSignal = signal<DashboardWithQuestions[]>([]);
  searchTermSignal = signal<string>('');
  loadingSignal = signal<boolean>(true);
  errorSignal = signal<string | null>(null);
  hoveredItemSignal = signal<number | null>(null);
  selectedViewSignal = signal<'grid' | 'list'>('grid');

  filteredDashboards = computed(() => {
    const searchTerm = this.searchTermSignal().toLowerCase();
    const dashboards = this.dashboardsSignal();

    if (!searchTerm) return dashboards;

    return dashboards.filter(dashboard =>
      dashboard.name.toLowerCase().includes(searchTerm) ||
      dashboard.description?.toLowerCase().includes(searchTerm)
    );
  });

  statsSignal = computed(() => ({
    totalDashboards: this.dashboardsSignal().length,
  }));

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AIAnalyticsService,
    private router: Router,
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAnalyticsData(forceRefresh: boolean = false): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.analyticsService.getAvailableDashboards({}, forceRefresh)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dashboards) => {
          const dashboardsWithQuestions: DashboardWithQuestions[] = dashboards.map(dashboard => ({
            ...dashboard,
            isExpanded: false,
          }));
          this.dashboardsSignal.set(dashboardsWithQuestions);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set('Failed to load analytics data. Please try again.');
          this.loadingSignal.set(false);
          console.error('Analytics loading error:', error);
        },
      });
  }


  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTermSignal.set(target.value);
  }

  onClearSearch(): void {
    this.searchTermSignal.set('');
  }

  onViewChange(view: 'grid' | 'list'): void {
    this.selectedViewSignal.set(view);
  }

  onDashboardHover(dashboardId: number | null): void {
    this.hoveredItemSignal.set(dashboardId);
  }

  onDashboardClick(dashboard: DashboardWithQuestions): void {
    this.router.navigate(['/analytics/dashboard', dashboard.id]);
  }


  onRefresh(): void {
    this.loadAnalyticsData(true);
  }

  trackByDashboardId(index: number, dashboard: DashboardWithQuestions): number {
    return dashboard.id;
  }


  formatDate(dateString?: string): string {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  }

  getTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'booking':
      case 'bookings':
        return 'pi-calendar';
      case 'expense':
      case 'expenses':
        return 'pi-money-bill';
      default:
        return 'pi-chart-line';
    }
  }

  getDashboardTypeFromName(name: string): string {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('booking') || nameLower.includes('حج')) {
      return 'booking';
    }
    if (nameLower.includes('expense') || nameLower.includes('مصروف')) {
      return 'expense';
    }
    return 'analytics';
  }

  getDashboardDescription(dashboard: DashboardWithQuestions): string {
    const type = this.getDashboardTypeFromName(dashboard.name);

    switch (type) {
      case 'booking':
        return 'analytics.analyticsDashboard.bookingDescription';
      case 'expense':
        return 'analytics.analyticsDashboard.expenseDescription';
      default:
        return 'analytics.analyticsDashboard.defaultDescription';
    }
  }
}

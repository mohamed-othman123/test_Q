import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Subject, takeUntil, forkJoin} from 'rxjs';
import {
  AIAnalyticsService,
  Dashboard,
  Question,
} from '../../a-i-analytics.service';
import {TranslateService, LangChangeEvent} from '@ngx-translate/core';
import {
  fadeInUp,
  slideInFromLeft,
  slideInFromRight,
  scaleIn,
  staggerCards,
  cardHover,
  pulseGlow,
  rotateIn,
} from '@core/animations/angular-animation';

export interface DashboardItem {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-analytics-overview',
  templateUrl: './analytics-overview.component.html',
  styleUrls: ['./analytics-overview.component.scss'],
  standalone: false,
  animations: [
    fadeInUp,
    slideInFromLeft,
    slideInFromRight,
    scaleIn,
    staggerCards,
    cardHover,
    pulseGlow,
    rotateIn,
  ],
})
export class AnalyticsOverviewComponent implements OnInit, OnDestroy {
  dashboards: Dashboard[] = [];
  questions: Question[] = [];

  allDashboards: DashboardItem[] = [];
  filteredItems: DashboardItem[] = [];

  loading = true;
  error: string | null = null;
  hoveredItem: number | null = null;

  stats = {
    totalDashboards: 0,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AIAnalyticsService,
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.loadAnalyticsData();

    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: LangChangeEvent) => {
        if (this.dashboards.length || this.questions.length) {
          this.processData();
          this.filterItems();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAnalyticsData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      dashboards: this.analyticsService.getAvailableDashboards(),
      questions: this.analyticsService.getAvailableQuestions(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({dashboards, questions}) => {
          this.dashboards = dashboards;
          this.questions = questions;

          this.processData();
          this.updateStats();
          this.filterItems();

          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load analytics data. Please try again.';
          this.loading = false;
        },
      });
  }

  private processData(): void {
    const defaultDashboardDesc = this.translate.instant(
      'analytics.defaultDashboardDescription',
    );

    this.allDashboards = this.dashboards.map((dashboard) => ({
      ...dashboard,
      description: dashboard.description || defaultDashboardDesc,
    }));
  }

  private updateStats(): void {
    this.stats = {
      totalDashboards: this.dashboards.length,
    };
  }

  filterItems(): void {
    this.filteredItems = [...this.allDashboards];
  }

  onItemClick(dashboard: DashboardItem): void {
    this.router.navigate(['/analytics/dashboard', dashboard.id]);
  }

  onRetry(): void {
    this.loadAnalyticsData();
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

  trackByItemId(index: number, item: DashboardItem): number {
    return item.id;
  }
}

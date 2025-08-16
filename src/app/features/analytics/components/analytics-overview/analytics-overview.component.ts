import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Subject, takeUntil, forkJoin} from 'rxjs';
import {
  AIAnalyticsService,
  Dashboard,
  Question,
} from '../../a-i-analytics.service';
import {TranslateService, LangChangeEvent} from '@ngx-translate/core';

export interface AnalyticsItem {
  id: number;
  name: string;
  description?: string;
  type: 'dashboard' | 'question';
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-analytics-overview',
  templateUrl: './analytics-overview.component.html',
  styleUrls: ['./analytics-overview.component.scss'],
  standalone: false,
})
export class AnalyticsOverviewComponent implements OnInit, OnDestroy {
  dashboards: Dashboard[] = [];
  questions: Question[] = [];

  allItems: AnalyticsItem[] = [];
  filteredItems: AnalyticsItem[] = [];

  loading = true;
  error: string | null = null;
  activeTab: 'all' | 'dashboards' | 'questions' = 'all';
  searchQuery = '';

  stats = {
    totalDashboards: 0,
    totalQuestions: 0,
    totalItems: 0,
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
    const defaultQuestionDesc = this.translate.instant(
      'analytics.defaultQuestionDescription',
    );

    const dashboardItems: AnalyticsItem[] = this.dashboards.map(
      (dashboard) => ({
        ...dashboard,
        type: 'dashboard' as const,
        description: dashboard.description || defaultDashboardDesc,
      }),
    );

    const questionItems: AnalyticsItem[] = this.questions.map((question) => ({
      ...question,
      type: 'question' as const,
      description: question.description || defaultQuestionDesc,
    }));

    this.allItems = [...dashboardItems, ...questionItems];
  }

  private updateStats(): void {
    this.stats = {
      totalDashboards: this.dashboards.length,
      totalQuestions: this.questions.length,
      totalItems: this.dashboards.length + this.questions.length,
    };
  }

  filterItems(): void {
    let items = [...this.allItems];

    if (this.activeTab === 'dashboards') {
      items = items.filter((item) => item.type === 'dashboard');
    } else if (this.activeTab === 'questions') {
      items = items.filter((item) => item.type === 'question');
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query)),
      );
    }

    this.filteredItems = items;
  }

  onTabChange(tab: 'all' | 'dashboards' | 'questions'): void {
    this.activeTab = tab;
    this.filterItems();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.filterItems();
  }

  onItemClick(item: AnalyticsItem): void {
    if (item.type === 'dashboard') {
      this.router.navigate(['/analytics/dashboard', item.id]);
    } else {
      this.router.navigate(['/analytics/question', item.id]);
    }
  }

  onRetry(): void {
    this.loadAnalyticsData();
  }

  getItemIcon(type: 'dashboard' | 'question'): string {
    return type === 'dashboard' ? 'pi pi-chart-line' : 'pi pi-chart-bar';
  }

  getItemTypeLabel(type: 'dashboard' | 'question'): string {
    const key =
      type === 'dashboard'
        ? 'analytics.type.dashboard'
        : 'analytics.type.question';
    return this.translate.instant(key);
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

  trackByItemId(index: number, item: AnalyticsItem): number {
    return item.id;
  }
}

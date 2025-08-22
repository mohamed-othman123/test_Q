import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, takeUntil, switchMap, of, Observable, tap } from 'rxjs';
import { AIAnalyticsService, Dashboard, DashboardUrl } from '../../a-i-analytics.service';
import { HallsService } from '@halls/services/halls.service';

@Component({
  selector: 'app-dashboard-viewer',
  templateUrl: './dashboard-viewer.component.html',
  styleUrls: ['./dashboard-viewer.component.scss'],
  standalone: false
})
export class DashboardViewerComponent implements OnInit, OnDestroy {
  @ViewChild('dashboardIframe', { static: false }) iframeElement!: ElementRef<HTMLIFrameElement>;

  dashboard: Dashboard | null = null;
  dashboardUrl: SafeResourceUrl | null = null;
  rawDashboardUrl: string | null = null;
  dashboardId: number | null = null;
  loading = true;
  error: string | null = null;
  iframeLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analyticsService: AIAnalyticsService,
    private hallsService: HallsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const id = params.get('id');
          if (!id || isNaN(Number(id))) {
            this.error = 'Invalid dashboard ID';
            this.loading = false;
            return of(null);
          }

          this.dashboardId = Number(id);
          return this.loadDashboard(this.dashboardId);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboard(dashboardId: number): Observable<any> {
    this.loading = true;
    this.error = null;
    this.iframeLoading = true;

    const hallIds = this.getEffectiveHallIds();

    return this.analyticsService.getDashboardUrl(dashboardId, hallIds)
      .pipe(
        takeUntil(this.destroy$),
        tap({
          next: (response: DashboardUrl) => {
            this.rawDashboardUrl = response.url;
            this.dashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.url);
            this.loading = false;
            this.loadDashboardMetadata(dashboardId);
          },
          error: (error) => {
            this.error = 'Failed to load dashboard. Please try again.';
            this.loading = false;
            this.iframeLoading = false;
          }
        })
      );
  }

  private getEffectiveHallIds(): number[] {
    const currentHall = this.hallsService.getCurrentHall();
    const availableHalls = this.hallsService.halls;

    if (currentHall) {
      return [currentHall.id];
    }

    if (availableHalls.length > 0) {
      return [availableHalls[0].id];
    }

    return [];
  }

  private loadDashboardMetadata(dashboardId: number): void {
    this.analyticsService.getAvailableDashboards()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dashboards) => {
          this.dashboard = dashboards.find(d => d.id === dashboardId) || null;
          if (!this.dashboard) {
            this.dashboard = {
              id: dashboardId,
              name: `Dashboard #${dashboardId}`,
              description: 'Analytics dashboard with business insights',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
        },
        error: (error) => {
          this.dashboard = {
            id: dashboardId,
            name: `Dashboard #${dashboardId}`,
            description: 'Analytics dashboard with business insights',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      });
  }

  onIframeLoad(): void {
    this.iframeLoading = false;
  }

  onIframeError(): void {
    this.iframeLoading = false;
    this.error = 'Failed to load dashboard content. The dashboard may be temporarily unavailable.';
  }

  onBackToDashboards(): void {
    this.router.navigate(['/analytics']);
  }

  onRefresh(): void {
    if (this.dashboardId) {
      this.loadDashboard(this.dashboardId).subscribe();
    }
  }

  onFullscreen(): void {
    if (this.iframeElement && this.iframeElement.nativeElement.requestFullscreen) {
      this.iframeElement.nativeElement.requestFullscreen();
    }
  }

  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  getCurrentHallInfo(): { name: string; id: number } | null {
    const currentHall = this.hallsService.getCurrentHall();
    return currentHall ? { name: currentHall.name, id: currentHall.id } : null;
  }

  isUsingHallContext(): boolean {
    return this.getEffectiveHallIds().length > 0;
  }
}

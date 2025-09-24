import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, shareReplay, catchError, of } from 'rxjs';
import { map, tap, retry, timeout } from 'rxjs/operators';
import { ApiConfigService } from '@core/services/api-config.service';
import { Dashboard, DashboardSearchOptions, AnalyticsError, AnalyticsMetrics, DashboardUrl, DashboardFilters, DashboardTypes, Question } from './models/analytics.model';

@Injectable({
  providedIn: 'root',
})
export class AIAnalyticsService {
  private readonly module = 'analytics';
  private readonly apiAnalyticsUrl = this.apiConfigService.getApiBaseUrl(this.module as any);
  private readonly REQUEST_TIMEOUT = 30000;
  private readonly RETRY_ATTEMPTS = 3;

  private readonly dashboardsSignal = signal<Dashboard[]>([]);
  private readonly questionsSignal = signal<Question[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<AnalyticsError | null>(null);
  private readonly metricsSignal = signal<AnalyticsMetrics>({
    totalDashboards: 0,
    totalQuestions: 0,
    recentlyViewed: 0,
    favoriteCount: 0
  });

  public readonly loading = computed(() => this.loadingSignal());
  public readonly error = computed(() => this.errorSignal());

  private readonly cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
  ) {
    this.setupEffects();
  }

  private setupEffects(): void {
    effect(() => {
      const dashboards = this.dashboardsSignal();
      const questions = this.questionsSignal();

      this.metricsSignal.update(current => ({
        ...current,
        totalDashboards: dashboards.length,
        totalQuestions: questions.length,
        recentlyViewed: dashboards.filter(d => d.last_accessed).length,
        lastSync: new Date().toISOString()
      }));
    });
  }

  getAvailableDashboards(options: DashboardSearchOptions = {}, forceRefresh: boolean = false): Observable<Dashboard[]> {
    const cacheKey = `dashboards-${JSON.stringify(options)}`;
    
    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        this.dashboardsSignal.set(cached);
        return of(cached);
      }
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const url = `${this.apiAnalyticsUrl}/available-dashboards`;
    let params = new HttpParams();

    if (options.query) params = params.set('query', options.query);
    if (options.type) params = params.set('type', options.type);
    if (options.sortBy) params = params.set('sortBy', options.sortBy);
    if (options.sortOrder) params = params.set('sortOrder', options.sortOrder);
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.offset) params = params.set('offset', options.offset.toString());

    return this.http.get<Dashboard[]>(url, { params }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      tap(dashboards => {
        this.dashboardsSignal.set(dashboards);
        this.setCache(cacheKey, dashboards);
        this.loadingSignal.set(false);
      }),
      catchError(() => {
        return of([]);
      }),
      shareReplay(1)
    );
  }

  getDashboardUrl(
    dashboardId: number,
    hallIds: number[],
    filters?: DashboardFilters
  ): Observable<DashboardUrl> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const url = `${this.apiAnalyticsUrl}/dashboard-url`;
    let params = this.buildDashboardParams(dashboardId, hallIds, filters);

    return this.http.get<DashboardUrl>(url, { params }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      tap(() => this.loadingSignal.set(false)),
      catchError(error => {
        throw error;
      })
    );
  }

  private buildDashboardParams(
    dashboardId: number,
    hallIds: number[],
    filters?: DashboardFilters
  ): HttpParams {
    let params = new HttpParams()
      .set('dashboardId', dashboardId.toString())
      .set('dashboardType', filters?.dashboardType || DashboardTypes.Booking);

    hallIds.forEach(hallId => {
      params = params.append('hallIds', hallId.toString());
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'dashboardType') {
          params = params.set(key, value.toString());
        }
      });
    }

    return params;
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
}

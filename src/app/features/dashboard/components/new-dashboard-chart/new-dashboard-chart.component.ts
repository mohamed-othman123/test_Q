import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {EChartsOption} from 'echarts';
import {
  Observable,
  Subscription,
  combineLatest,
  startWith,
  map,
  tap,
  debounceTime,
} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {DashboardFacadeService} from '@dashboard/services/dashboard-facade.service';

export interface ChartData {
  period: string; // This will be the date string from the API (e.g., '2025-03-10' or '2025-03-01')
  totalExpenses: number;
  totalBookings: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-new-dashboard-chart',
  templateUrl: './new-dashboard-chart.component.html',
  styleUrls: ['./new-dashboard-chart.component.scss'],
  standalone: false,
})
export class NewDashboardChartComponent implements OnInit, OnDestroy {
  chartOption: EChartsOption = {};
  chartFilter$ = this.dashboardFacade.chartFilter$;
  chartData$: Observable<ChartData[]>;

  legendData = {
    totalBookings: 0,
    totalRevenue: 0,
    totalExpenses: 0,
  };

  // resolved data from the route (initial data)
  private resolvedChartData: {[key: string]: any} =
    this.route.snapshot.data['resolvedData'];

  // language change subscription
  private langChangeSubscription!: Subscription;
  // service subscription if needed
  private dataSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private dashboardFacade: DashboardFacadeService,
    private cd: ChangeDetectorRef,
  ) {
    this.chartData$ = this.dashboardFacade.chartData$.pipe(
      startWith(this.resolvedChartData['chartData']),
      debounceTime(100),
      map((data) => {
        return this.transformApiData(data, this.chartFilter$.value);
      }),
      tap((chartData: ChartData[]) => {
        this.updateChartOptions(chartData);
      }),
    );
  }

  ngOnInit(): void {
    this.initializeChartOptions();

    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => {
        // on language change, re-update the chart options with new labels
        this.chartData$.subscribe((chartData) => {
          this.updateChartOptions(chartData);
          this.cd.detectChanges();
        });
      },
    );
  }

  // Transform API data (object) into an array of ChartData
  transformApiData(
    apiData: {[key: string]: any},
    filter: 'week' | 'month',
  ): ChartData[] {
    const dataArray: ChartData[] = [];
    Object.keys(apiData).forEach((key) => {
      if (
        key === 'totalBookings' ||
        key === 'totalRevenue' ||
        key === 'totalExpenses'
      ) {
        this.legendData[key] = apiData[key];
        return;
      }
      dataArray.push({
        period: key,
        totalExpenses: apiData[key].totalExpenses,
        totalBookings: apiData[key].totalBookings,
        totalRevenue: apiData[key].totalRevenue,
      });
    });
    //  sort by date
    return dataArray.sort(
      (a, b) => new Date(a.period).getTime() - new Date(b.period).getTime(),
    );
  }

  // Initialize chart options with base config
  initializeChartOptions(): void {
    this.chartOption = {
      ...this.getBaseChartConfig(),
      series: [
        {
          name: this.translateService.instant('dashboard.totalBookings'),
          type: 'bar',
          barWidth: 8,
          itemStyle: {borderRadius: [20, 20, 0, 0]},
          data: [],
        },
        {
          name: this.translateService.instant('dashboard.totalRevenue'),
          type: 'bar',
          barWidth: 8,
          itemStyle: {borderRadius: [20, 20, 0, 0]},
          data: [],
        },
        {
          name: this.translateService.instant('dashboard.totalExpenses'),
          type: 'bar',
          barWidth: 8,
          itemStyle: {borderRadius: [20, 20, 0, 0]},
          data: [],
        },
      ],
      xAxis: {
        ...this.getBaseChartConfig().xAxis,
      },
    };
  }

  // Base configuration adopted from your old component
  private getBaseChartConfig(): EChartsOption {
    return {
      color: ['#14c6a5', '#75B940', '#e74545'],
      tooltip: {
        trigger: 'axis',
        position: this.translateService.currentLang === 'ar' ? 'left' : 'right',
        formatter: (params: any) => {
          const isArabic = this.translateService.currentLang === 'ar';
          const direction = isArabic ? 'rtl' : 'ltr';
          let result = `<div style="direction: ${direction}; text-align: ${isArabic ? 'right' : 'left'}">`;
          result += `<div>${params[0].name}</div>`;
          params.forEach((param: any) => {
            result += `<div>
              ${param.marker}
              ${param.seriesName}: ${this.abbreviateNumber(param.value, param.seriesName)}
            </div>`;
          });
          result += '</div>';
          return result;
        },
        textStyle: {
          fontFamily: `"Zain", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
        },
      },
      legend: {
        data: [
          this.translateService.instant('dashboard.totalExpenses'),
          this.translateService.instant('dashboard.totalRevenue'),
          this.translateService.instant('dashboard.totalBookings'),
        ],
        show: false,
        textStyle: {
          fontFamily: `"Zain", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
        },
      },
      // Explicitly set xAxis as a category axis including an empty data array.
      xAxis: {
        type: 'category',
        data: [],
        inverse: this.translateService.currentLang === 'ar',
        axisLabel: {
          align: this.translateService.currentLang === 'ar' ? 'right' : 'left',
          fontFamily: `"Zain", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
        },
      },
      yAxis: {
        type: 'value',
        position: this.translateService.currentLang === 'ar' ? 'right' : 'left',
        axisLabel: {
          fontFamily: `"Zain", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
        },
      },
      title: {
        textStyle: {
          fontFamily: `"Zain", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
        },
      },
      textStyle: {
        fontFamily: `"Zain", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
      },
    };
  }

  // Update chart options based on transformed chart data
  updateChartOptions(chartData: ChartData[]): void {
    this.chartOption = {
      ...this.getBaseChartConfig(),
      series: [
        {
          name: this.translateService.instant('dashboard.totalBookings'),
          data: chartData.map((item) => item.totalBookings),
          type: 'bar',
          barWidth: 8,
          itemStyle: {borderRadius: [20, 20, 0, 0]},
        },
        {
          name: this.translateService.instant('dashboard.totalRevenue'),
          data: chartData.map((item) => item.totalRevenue / 1000),
          type: 'bar',
          barWidth: 8,
          itemStyle: {borderRadius: [20, 20, 0, 0]},
        },
        {
          name: this.translateService.instant('dashboard.totalExpenses'),
          data: chartData.map((item) => item.totalExpenses / 1000),
          type: 'bar',
          barWidth: 8,
          itemStyle: {borderRadius: [20, 20, 0, 0]},
        },
      ],
      xAxis: {
        ...this.getBaseChartConfig().xAxis,
        boundaryGap: true,
        data: chartData.map((item) =>
          this.generateXAxisLabel(
            new Date(item.period),
            this.chartFilter$.value,
          ),
        ),
        type: 'category',
        axisLabel: {
          align:
            this.translateService.getCurrentLang() === 'ar' ? 'right' : 'left',
          fontFamily: `"Zain", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
        },
      },
    };
  }

  abbreviateNumber(value: number, seriesName: string): string {
    if (value == null) return '0';

    if (
      seriesName === this.translateService.instant('dashboard.totalBookings')
    ) {
      return value.toString();
    }

    const originalValue = value * 1000;

    if (originalValue < 1000) {
      return originalValue.toString();
    }
    const abbreviated = (originalValue / 1000).toFixed(2);
    return abbreviated.replace(/\.0$/, '') + 'k';
  }

  // Generate X-axis label depending on filter: 'weekly' shows "Week X", 'monthly' shows month name.
  generateXAxisLabel(date: Date, filter: 'week' | 'month'): string {
    if (filter === 'week') {
      return `${this.translateService.instant('dashboard.week')} ${this.getWeekNumber(date)}`;
    } else {
      return date.toLocaleDateString(
        this.translateService.currentLang === 'ar' ? 'ar-EG' : 'en-US',
        {month: 'short'},
      );
    }
  }

  // Calculate week number from date
  getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  toggleView(filter: 'week' | 'month'): void {
    this.chartFilter$.next(filter);
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}

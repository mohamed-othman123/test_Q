import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ChartData} from '@dashboard/models/dashboard.model';
import {DashboardFacadeService} from '@dashboard/services/dashboard-facade.service';
import {HallsService} from '@halls/services/halls.service';
import {TranslateService} from '@ngx-translate/core';
import {EChartsOption} from 'echarts';
import {
  BehaviorSubject,
  startWith,
  map,
  tap,
  Observable,
  debounceTime,
  Subscription,
} from 'rxjs';

@Component({
  selector: 'app-dashboard-chart',
  templateUrl: './dashboard-chart.component.html',
  styleUrl: './dashboard-chart.component.scss',
  standalone: false,
})
export class DashboardChartComponent implements OnInit, OnDestroy {
  chartOption: EChartsOption = {};

  chartFilter$ = this.dashboardFacade.chartFilter$;
  private hall$ = new BehaviorSubject(this.hallService.getCurrentHall()!);
  legendData = {
    totalBookings: 0,
    totalRevenue: 0,
    totalExpenses: 0,
  };

  chartData$: Observable<ChartData[]>;
  resolvedChartData: ChartData[];
  private langChangeSubscription!: Subscription;

  constructor(
    private hallService: HallsService,
    private translateService: TranslateService,
    private dashboardFacade: DashboardFacadeService,
    private route: ActivatedRoute,
  ) {
    this.resolvedChartData = this.route.snapshot.data['resolvedData']
      .chartData as ChartData[];

    this.chartData$ = this.dashboardFacade.chartData$.pipe(
      startWith(this.resolvedChartData),
      map((data) =>
        this.processChartData(
          data,
          this.chartFilter$.value,
          this.hallService.getCurrentHall()!.id,
        ),
      ),
      debounceTime(100),
      tap((chartData) => {
        this.updateChartOptions(chartData);
        this.getLegendData(chartData);
      }),
    );
  }

  ngOnInit() {
    this.initializeChartOptions();

    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => {
        if (this.resolvedChartData) {
          const processedData = this.processChartData(
            this.resolvedChartData,
            this.chartFilter$.value,
            this.hallService.getCurrentHall()!.id,
          );
          this.updateChartOptions(processedData);
        }
      },
    );
  }

  private getBaseChartConfig(): EChartsOption {
    return {
      color: ['#E74545', '#75B940', '#1BB49F'],
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
              ${param.seriesName}:
              ${param.value}
            </div>`;
          });

          result += '</div>';
          return result;
        },
        textStyle: {
          fontFamily: `"Zain", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
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
          fontFamily: `"Zain", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
        },
      },
      xAxis: {
        type: 'category',
        inverse: this.translateService.currentLang === 'ar',
        axisLabel: {
          align: this.translateService.currentLang === 'ar' ? 'right' : 'left',
          fontFamily: `"Zain", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
        },
      },
      yAxis: {
        type: 'value',
        position: this.translateService.currentLang === 'ar' ? 'right' : 'left',
        axisLabel: {
          fontFamily: `"Zain", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
        },
      },
      title: {
        textStyle: {
          fontFamily: `"Zain", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
        },
      },
      textStyle: {
        fontFamily: `"Zain", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
      },
    };
  }

  private initializeChartOptions() {
    this.chartOption = {
      ...this.getBaseChartConfig(),
      series: [
        {
          name: this.translateService.instant('dashboard.totalBookings'),
          type: 'bar',
          barWidth: 8,
          itemStyle: {borderRadius: [20, 20, 0, 0]},
        },
        {
          name: this.translateService.instant('dashboard.totalRevenue'),
          type: 'bar',
          barWidth: 8,
          itemStyle: {borderRadius: [20, 20, 0, 0]},
        },
        {
          name: this.translateService.instant('dashboard.totalExpenses'),
          type: 'bar',
          barWidth: 8,
          itemStyle: {borderRadius: [20, 20, 0, 0]},
        },
      ],
    };
  }

  private updateChartOptions(chartData: ChartData[]): void {
    this.chartOption = {
      ...this.getBaseChartConfig(),
      series: [
        {
          // total expenses
          name: this.translateService.instant('dashboard.totalExpenses'),
          data: chartData.map((item) => {
            return this.abbreviateNumber(item.totalExpenses);
          }),
          type: 'bar',
          barWidth: 8,
          itemStyle: {borderRadius: [20, 20, 0, 0]},
        },
        {
          // total revenue
          name: this.translateService.instant('dashboard.totalRevenue'),
          data: chartData.map((item) =>
            this.abbreviateNumber(item.totalRevenue),
          ),
          type: 'bar',
          barWidth: 8,
          itemStyle: {borderRadius: [20, 20, 0, 0]},
        },
        {
          // total bookings
          name: this.translateService.instant('dashboard.totalBookings'),
          data: chartData.map((item) => item.totalBookings),
          type: 'bar',
          barWidth: 8,
          itemStyle: {borderRadius: [20, 20, 0, 0]},
        },
      ],
      xAxis: {
        ...this.getBaseChartConfig().xAxis,
        data: this.generateXAxisLabels(chartData),
        type: 'category',
        boundaryGap: true,
        axisLabel: {
          ...(this.getBaseChartConfig().xAxis &&
            (this.getBaseChartConfig().xAxis as any).axisLabel),
          // explicitly set type to "category" for axisLabel
          type: 'category',
        },
      },
    };
  }

  abbreviateNumber(value: number): string {
    if (value == null) return '0';
    if (value < 1000) {
      return Math.floor(value).toString();
    }
    const abbreviated = (value / 1000).toFixed(2);
    return abbreviated.replace(/\.0$/, '') + 'k';
  }

  private getLegendData(chartData: ChartData[]): void {
    this.legendData = {
      totalBookings: 0,
      totalRevenue: 0,
      totalExpenses: 0,
    };
    this.legendData = chartData.reduce((acc, item) => {
      acc.totalBookings += item.totalBookings;
      acc.totalRevenue += item.totalRevenue;
      acc.totalExpenses += item.totalExpenses;
      return acc;
    }, this.legendData);
  }

  private generateXAxisLabels(chartData: ChartData[]): string[] {
    return chartData.map((item) => {
      const date = new Date(item.period);
      return this.chartFilter$.value === 'week'
        ? `${this.translateService.instant('dashboard.week')} ${this.getWeekNumber(date)}`
        : date.toLocaleDateString(
            this.translateService.currentLang === 'ar' ? 'ar-EG' : 'en-US',
            {month: 'short'},
          );
    });
  }

  private processChartData(
    data: ChartData[],
    chartFilter: 'week' | 'month',
    hallId: number,
  ): ChartData[] {
    const filteredData = this.filterDataByType(data, chartFilter);
    return this.generatePeriods(filteredData, chartFilter, hallId);
  }

  private filterDataByType(
    data: ChartData[],
    chartFilter: string,
  ): ChartData[] {
    return data.filter((item) => item.interval_type === chartFilter);
  }

  private generatePeriods(
    filteredData: ChartData[],
    chartFilter: 'week' | 'month',
    hallId: number,
  ): ChartData[] {
    return Array.from({length: 12}, (_, index) => {
      const now = new Date();
      const date = this.calculatePeriodDate(now, index, chartFilter);
      const existingData = this.findMatchingData(
        filteredData,
        date,
        chartFilter,
      );
      return existingData || this.createEmptyPeriod(date, chartFilter, hallId);
    });
  }

  private calculatePeriodDate(
    now: Date,
    index: number,
    chartFilter: 'week' | 'month',
  ): Date {
    const date = new Date(now);
    if (chartFilter === 'week') {
      date.setDate(now.getDate() - (11 - index) * 7);
    } else {
      date.setDate(1);
      date.setMonth(now.getMonth() - (11 - index));
    }
    return date;
  }

  private findMatchingData(
    filteredData: ChartData[],
    date: Date,
    chartFilter: 'week' | 'month',
  ): ChartData | undefined {
    return filteredData.find((item) => {
      const itemDate = new Date(item.period);
      return chartFilter === 'week'
        ? this.isSameWeek(itemDate, date)
        : this.isSameMonth(itemDate, date);
    });
  }

  private isSameWeek(date1: Date, date2: Date): boolean {
    return this.getWeekNumber(date1) === this.getWeekNumber(date2);
  }

  private isSameMonth(date1: Date, date2: Date): boolean {
    return (
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  private createEmptyPeriod(
    date: Date,
    chartFilter: string,
    hallId: number,
  ): ChartData {
    return {
      hall_id: hallId,
      period: date,
      totalBookings: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      interval_type: chartFilter,
      month_number: 0,
      week_number: 0,
    };
  }

  getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  ngOnDestroy() {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }
}

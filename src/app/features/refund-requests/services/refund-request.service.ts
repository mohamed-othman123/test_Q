import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DataTableFilter, GaCustomEvents, TableData} from '@core/models';
import {NotificationService} from '@core/services';
import {ApiConfigService} from '@core/services/api-config.service';
import {RefundRequest} from '@refund-requests/models/refund-request.model';
import {Observable, tap} from 'rxjs';
import {UpdateRefundRequestDto} from './dto/update-refund.dto';
import {CreateRefundRequestDto} from './dto/create-refund.dto';
import {GtagService} from '@core/analytics/gtag.service';
import {GaConfigService} from '@core/analytics/ga-config.service';

@Injectable()
export class RefundRequestsService {
  private module = 'refund-requests';
  private apiRefundRequestUrl;

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {
    this.apiRefundRequestUrl = this.apiConfigService.getApiBaseUrl(
      this.module as any,
    );
  }

  createOne(payload: CreateRefundRequestDto) {
    return this.http.post(this.apiRefundRequestUrl, payload).pipe(
      tap(() => {
        this.notificationService.showSuccess('refunds.requestAdded');
      }),
    );
  }

  getAll(filters: DataTableFilter) {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<RefundRequest>>(this.apiRefundRequestUrl, {
      params,
    });
  }

  getOne(id: number) {
    const url = `${this.apiRefundRequestUrl}/${id}`;
    return this.http.get<RefundRequest>(url);
  }

  updateOne(id: number, payload: UpdateRefundRequestDto) {
    const url = `${this.apiRefundRequestUrl}/${id}`;
    return this.http.patch(url, payload).pipe(
      tap(() => {
        this.notificationService.showSuccess('refunds.requestUpdated');

        this.gtag.event(GaCustomEvents.UPDATE_REFUND_REQUEST, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });
      }),
    );
  }

  deleteOne(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiRefundRequestUrl}/${id}`)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('refunds.refundDeleted'),
        ),
      );
  }

  updateRefundStatus(id: number, payload: UpdateRefundRequestDto) {
    const url = `${this.apiRefundRequestUrl}/${id}/status`;
    return this.http.patch(url, payload).pipe(
      tap(() => {
        this.notificationService.showSuccess('refunds.requestUpdated');

        this.gtag.event(GaCustomEvents.UPDATE_REFUND_REQUEST, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });
      }),
    );
  }
}

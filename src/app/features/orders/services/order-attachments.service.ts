import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {NotificationService} from '@core/services';
import {ApiConfigService} from '@core/services/api-config.service';
import {BookingAttachments} from '@orders/models';
import {Observable, tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderAttachmentsService {
  module = 'booking';
  apiBookingUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
    private notificationService: NotificationService,
  ) {}

  deleteAttachment(bookingId: string, attachmentId: string): Observable<void> {
    const url = `${this.apiBookingUrl}/${bookingId}/attachments/${attachmentId}`;
    return this.http
      .delete<void>(url)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('purchases.attachment_deleted'),
        ),
      );
  }

  addAttachment(bookingId: string, formData: FormData) {
    const url = `${this.apiBookingUrl}/${bookingId}/attachments`;
    return this.http
      .post<BookingAttachments[]>(url, formData)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('purchases.attachment_added'),
        ),
      );
  }

  editAttachment(bookingId: string, attachmentId: string, updatedName: string) {
    const url = `${this.apiBookingUrl}/${bookingId}/attachments/${attachmentId}`;
    return this.http
      .patch<BookingAttachments>(url, {name: updatedName})
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('purchases.attachment_updated'),
        ),
      );
  }
}

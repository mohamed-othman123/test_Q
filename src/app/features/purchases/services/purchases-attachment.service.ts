import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {NotificationService} from '@core/services';
import {ApiConfigService} from '@core/services/api-config.service';
import {PurchaseAttachment} from '@purchases/models/purchase-model';
import {combineLatest, map, Observable, of, tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PurchasesAttachmentService {
  module = 'expenses';
  apiExpensesUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
    private notificationService: NotificationService,
  ) {}

  getAttachmentsAsBlobs(attachments: PurchaseAttachment[]) {
    if (!attachments?.length) {
      return of([]);
    }

    const attachmentsArray$ = attachments.map(
      (attachment: PurchaseAttachment) => {
        return this.http.get(attachment.path, {responseType: 'blob'}).pipe(
          map((blob: Blob) => {
            return {
              id: attachment.id,
              name: attachment.name,
              file: blob,
            } as PurchaseAttachment;
          }),
        );
      },
    );

    return combineLatest(attachmentsArray$);
  }

  deleteAttachment(purchaseId: string, attachmentId: string): Observable<void> {
    const url = `${this.apiExpensesUrl}/${purchaseId}/attachments/${attachmentId}`;
    return this.http
      .delete<void>(url)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('purchases.attachment_deleted'),
        ),
      );
  }

  addAttachment(purchaseId: string, formData: FormData) {
    const url = `${this.apiExpensesUrl}/${purchaseId}/attachments`;
    return this.http
      .post(url, formData)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('purchases.attachment_added'),
        ),
      );
  }

  editAttachment(
    purchaseId: string,
    attachmentId: string,
    updatedName: string,
  ) {
    const url = `${this.apiExpensesUrl}/${purchaseId}/attachments/${attachmentId}`;
    return this.http
      .patch(url, {name: updatedName})
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('purchases.attachment_updated'),
        ),
      );
  }
}

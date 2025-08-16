import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {NotificationService} from '@core/services';
import {ApiConfigService} from '@core/services/api-config.service';
import {ContractAttachment} from '@halls/models/contract-attachment.model';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContractAttachmentsService {
  private module = 'halls';
  private apiHallsUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
  ) {}

  addAttachment(contractId: number, formData: FormData) {
    const url = `${this.apiHallsUrl}/contracts/${contractId}/attachments`;
    return this.http
      .post<ContractAttachment[]>(url, formData)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('halls.attachment_added'),
        ),
      );
  }

  updateAttachment(
    contractId: number,
    attachmentId: number,
    payload: {name: string},
  ) {
    const url = `${this.apiHallsUrl}/contracts/${contractId}/attachments/${attachmentId}`;
    return this.http
      .patch<ContractAttachment[]>(url, payload)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('halls.attachment_updated'),
        ),
      );
  }

  getAttachments(contractId: number) {
    const url = `${this.apiHallsUrl}/contracts/${contractId}/attachments`;
    return this.http.get<ContractAttachment[]>(url);
  }

  deleteAttachment(contractId: number, attachmentId: number) {
    const url = `${this.apiHallsUrl}/contracts/${contractId}/attachments/${attachmentId}`;
    return this.http
      .delete<ContractAttachment[]>(url)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('halls.attachment_deleted'),
        ),
      );
  }
}

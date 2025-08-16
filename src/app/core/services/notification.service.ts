import {Injectable} from '@angular/core';
import {MessageService} from 'primeng/api';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
  ) {}

  showSuccess(messageKey: string) {
    this.translateService
      .get(messageKey)
      .subscribe((translatedMessage: string) => {
        this.messageService.add({
          severity: 'success',
          summary: translatedMessage,
        });
      });
  }

  showError(messageKey: string) {
    this.translateService
      .get(messageKey)
      .subscribe((translatedMessage: string) => {
        this.messageService.add({
          severity: 'error',
          summary: translatedMessage,
        });
      });
  }

  showInfo(messageKey: string) {
    this.translateService
      .get(messageKey)
      .subscribe((translatedMessage: string) => {
        this.messageService.add({
          severity: 'info',
          summary: translatedMessage,
        });
      });
  }
}

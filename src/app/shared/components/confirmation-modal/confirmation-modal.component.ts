import {Component} from '@angular/core';
import {ConfirmationModalService} from '@core/services/confirmation-modal.service';

@Component({
    selector: 'app-confirmation-modal',
    templateUrl: './confirmation-modal.component.html',
    styleUrl: './confirmation-modal.component.scss',
    standalone: false
})
export class ConfirmationModalComponent {
  display$ = this.confirmationModalService.display$;
  mode$ = this.confirmationModalService.mode;

  constructor(private confirmationModalService: ConfirmationModalService) {}

  onConfirm() {
    this.confirmationModalService.confirm();
  }

  onReject() {
    this.confirmationModalService.reject();
  }

  onClose() {
    this.confirmationModalService.close();
  }
}

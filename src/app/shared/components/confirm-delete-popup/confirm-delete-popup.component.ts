import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'app-confirm-delete-popup',
    templateUrl: './confirm-delete-popup.component.html',
    styleUrl: './confirm-delete-popup.component.scss',
    standalone: false
})
export class ConfirmDeletePopupComponent {
  @Input() message!: string;
  @Input() visible: boolean = false;

  @Output() confirm = new EventEmitter();
  @Output() reject = new EventEmitter();

  confirmBtn() {
    this.confirm.emit(true);
  }

  rejectBtn() {
    this.reject.emit(true);
  }
}

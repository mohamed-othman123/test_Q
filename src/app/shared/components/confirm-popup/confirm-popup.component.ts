import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-confirm-popup',
  templateUrl: './confirm-popup.component.html',
  styleUrl: './confirm-popup.component.scss',
  standalone: false,
})
export class ConfirmPopupComponent {
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

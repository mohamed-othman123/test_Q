
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss',
    standalone: false
})
export class ModalComponent {
  constructor() {}
  @Input() showCloseBtn: boolean = true;
  @Input() modalId!: string;
  @Output() closeModal: EventEmitter<string> = new EventEmitter();

  closeOpenModal() {
    this.closeModal.emit();
  }
}

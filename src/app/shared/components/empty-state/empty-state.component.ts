import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'app-empty-state',
    templateUrl: './empty-state.component.html',
    styleUrl: './empty-state.component.scss',
    standalone: false
})
export class EmptyStateComponent {
  @Input() customMessage!: string;
  @Input() showBtn: boolean = false;
  @Input() logOutBtn: boolean = false;
  @Input() btnLabel: string = ''
  @Output() onToggle: EventEmitter<void> = new EventEmitter<void>()
  @Output() logoutFunction: EventEmitter<void> = new EventEmitter<void>()
  toggleSideDrawer() {
    this.onToggle.emit()
  }
  logoutFun() {
    this.logoutFunction.emit()
  }
}

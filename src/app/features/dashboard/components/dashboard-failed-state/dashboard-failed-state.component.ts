import {Component, EventEmitter, Output} from '@angular/core';

@Component({
    selector: 'app-dashboard-failed-state',
    templateUrl: './dashboard-failed-state.component.html',
    styleUrl: './dashboard-failed-state.component.scss',
    standalone: false
})
export class DashboardFailedStateComponent {
  @Output() retry = new EventEmitter<void>();
}

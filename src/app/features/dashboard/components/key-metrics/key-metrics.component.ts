import {Component, Input} from '@angular/core';
import {KeyMetrics} from '@dashboard/models/dashboard.model';

@Component({
    selector: 'app-key-metrics',
    templateUrl: './key-metrics.component.html',
    styleUrl: './key-metrics.component.scss',
    standalone: false
})
export class KeyMetricsComponent {
  @Input() keyMetrics!: KeyMetrics;
}

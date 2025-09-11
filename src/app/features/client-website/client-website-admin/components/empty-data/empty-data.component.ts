import {Component, EventEmitter, Input, Output} from '@angular/core';
import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
    selector: 'app-empty-data',
    templateUrl: './empty-data.component.html',
    styleUrl: './empty-data.component.scss',
    animations: [
        trigger('floatAnimation', [
            state('void', style({
                opacity: 0,
                transform: 'scale(0.8) translateY(30px)',
            })),
            state('visible', style({
                opacity: 1,
                transform: 'scale(1) translateY(0)',
            })),
            transition('void => visible', [
                animate('0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'),
            ]),
        ]),
        trigger('pulseAndFloat', [
            state('visible', style({ transform: 'translateY(0)' })),
            transition('void => visible', [
                animate('2s ease-in-out', keyframes([
                    style({
                        opacity: 0,
                        transform: 'scale(0) translateY(40px)',
                        offset: 0,
                    }),
                    style({
                        opacity: 1,
                        transform: 'scale(1.2) translateY(-10px)',
                        offset: 0.4,
                    }),
                    style({
                        transform: 'scale(0.9) translateY(5px)',
                        offset: 0.7,
                    }),
                    style({
                        transform: 'scale(1) translateY(0)',
                        offset: 1,
                    }),
                ])),
            ]),
        ]),
        trigger('slideInFade', [
            transition('void => visible', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('0.5s 0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
        ]),
        trigger('buttonPop', [
            transition('void => visible', [
                style({ opacity: 0, transform: 'scale(0.5)' }),
                animate('0.5s 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ opacity: 1, transform: 'scale(1)' })),
            ]),
        ]),
    ],
    standalone: false
})
export class EmptyDataComponent {
  @Input() icon: string = 'pi pi-info-circle';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() showButton: boolean = false;
  @Input() buttonIcon: string = 'pi pi-plus';
  @Input() buttonLabel: string = '';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() buttonClass: string = 'p-button-primary';
  @Input() hideAddButton: boolean = false;

  @Output() action = new EventEmitter<void>();

  onAction(): void {
    this.action.emit();
  }
}

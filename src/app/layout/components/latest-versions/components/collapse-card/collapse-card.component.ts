import {Component, Input} from '@angular/core';
import {LanguageService} from '@core/services';

@Component({
    selector: 'app-collapse-card',
    templateUrl: './collapse-card.component.html',
    styleUrl: './collapse-card.component.scss',
    standalone: false
})
export class CollapseCardComponent {
  @Input() data: any;

  showContent = false;

  constructor(public lang: LanguageService) {}

  toggleContent() {
    this.showContent = !this.showContent;
  }
}

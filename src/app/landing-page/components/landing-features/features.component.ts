import {LandingPageSection} from '@admin-landing-page/models/section.model';

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'app-features',
    imports: [TranslateModule],
    templateUrl: './features.component.html',
    styleUrl: './features.component.scss'
})
export class FeaturesComponent {
  @Input() section: LandingPageSection | null = null;
  @Input() lang!: string;
  @Output() orderPricingRequested = new EventEmitter<void>();

  showOrderPricing() {
    this.orderPricingRequested.emit();
  }
  ngOnInit(): void {}
}

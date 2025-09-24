import {Component, Input} from '@angular/core';
import {LandingGeneralInformationDto} from '@client-website-admin/models/landing-page.model';
import {LanguageService} from '@core/services';

@Component({
    selector: 'app-hall-metrics',
    templateUrl: './hall-metrics.component.html',
    styleUrls: ['./hall-metrics.component.scss'],
    standalone: false
})
export class HallMetricsComponent {
  @Input() landingPageData: LandingGeneralInformationDto | null = null;
  @Input() section: any = null;

  constructor(public lang: LanguageService) {}
}

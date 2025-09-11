import {Component, Input} from '@angular/core';
import {LandingGeneralInformationDto} from '@client-website-admin/models/landing-page.model';
import {LanguageService} from '@core/services';

@Component({
    selector: 'app-hall-details',
    templateUrl: './hall-details.component.html',
    styleUrls: ['./hall-details.component.scss'],
    standalone: false
})
export class HallDetailsComponent {
  @Input() landingPageData: LandingGeneralInformationDto | null = null;

  constructor(public lang: LanguageService) {}
}

import {Component, Input} from '@angular/core';
import {LandingGeneralInformationDto} from '@client-website-admin/models/landing-page.model';
import {LanguageService} from '@core/services';

@Component({
    selector: 'app-hall-events',
    templateUrl: './hall-events.component.html',
    styleUrls: ['./hall-events.component.scss'],
    standalone: false
})
export class HallEventsComponent {
  @Input() landingPageData: LandingGeneralInformationDto | null = null;
  @Input() section: any = null;

  constructor(public lang: LanguageService) {}
}

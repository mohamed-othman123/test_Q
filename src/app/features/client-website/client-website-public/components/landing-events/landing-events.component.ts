import {Component, Input} from '@angular/core';
import {LandingGeneralInformationDto} from '@client-website-admin/models/landing-page.model';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'app-landing-events',
    imports: [TranslateModule],
    templateUrl: './landing-events.component.html',
    styleUrl: './landing-events.component.scss'
})
export class LandingEventsComponent {
  @Input() lang!: string;
  @Input() section: any;
  @Input() landingPageData!: LandingGeneralInformationDto;
}

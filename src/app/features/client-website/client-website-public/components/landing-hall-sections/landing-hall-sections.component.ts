import {Component, Input} from '@angular/core';
import {LandingGeneralInformationDto} from '@client-website-admin/models/landing-page.model';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'app-landing-hall-sections',
    imports: [TranslateModule],
    templateUrl: './landing-hall-sections.component.html',
    styleUrl: './landing-hall-sections.component.scss'
})
export class LandingHallSectionsComponent {
  @Input() lang!: string;
  @Input() section: any;
  @Input() landingPageData!: LandingGeneralInformationDto;
}

import {Component, Input, OnInit} from '@angular/core';

import {TranslateModule} from '@ngx-translate/core';
import {LandingGeneralInformationDto} from '@admin-landing-page/models/landing-page.model';
import {LandingPageSection} from '@admin-landing-page/models/section.model';

@Component({
    selector: 'app-footer',
    imports: [TranslateModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  @Input() data: LandingGeneralInformationDto | null = null;
  section: LandingPageSection | null = null;
  ngOnInit(): void {
    this.section = this.data?.sections?.find(
      (section) => section.type === 'socialLinks',
    )!;
  }
}

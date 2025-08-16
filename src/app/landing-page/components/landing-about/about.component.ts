import {LandingPageSection} from '@admin-landing-page/models/section.model';
import {Component, Input, OnInit} from '@angular/core';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {SharedModule} from '@shared/shared.module';

@Component({
    selector: 'app-about',
    imports: [FontAwesomeModule, SharedModule],
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  @Input() section: LandingPageSection | null = null;
  @Input() lang!: string;

  constructor() {}

  ngOnInit() {}
}

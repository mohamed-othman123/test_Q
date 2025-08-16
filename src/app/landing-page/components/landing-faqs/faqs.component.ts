import {Component, Input, OnInit} from '@angular/core';
import {IFaqs} from '@core/interfaces/landing-pages/i-faqs';
import {NgbAccordionModule} from '@ng-bootstrap/ng-bootstrap';

import {LandingPageSection} from '@admin-landing-page/models/section.model';

@Component({
    selector: 'app-faqs',
    imports: [NgbAccordionModule],
    templateUrl: './faqs.component.html',
    styleUrl: './faqs.component.scss'
})
export class FaqsComponent implements OnInit {
  @Input() section: LandingPageSection | null = null;
  @Input() lang!: string;

  ngOnInit(): void {}
}

import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  DOCUMENT,
} from '@angular/core';
import {GalleryComponent} from './landing-gallery/gallery.component';
import {FeaturesComponent} from './landing-features/features.component';
import {HeroComponent} from './landing-hero/hero.component';
import {FooterComponent} from './landing-footer/footer.component';
import {HeaderComponent} from './landing-header/header.component';
import {AboutComponent} from './landing-about/about.component';
import {ClientsComponent} from './landing-clients/clients.component';
import {ContactsComponent} from './landing-contacts/contacts.component';
import {FaqsComponent} from './landing-faqs/faqs.component';
import {OrderPricingComponent} from './order-pricing/order-pricing.component';
import {LandingPageService} from '@core/services/landing-page.service';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ActivatedRoute} from '@angular/router';

import {LandingDepartmentsComponent} from './landing-departments/landing-departments.component';
import {Title} from '@angular/platform-browser';
import {FaviconService} from '@core/services/favicon.service';
import {LandingGeneralInformationDto} from '@client-website-admin/models/landing-page.model';
import {Subject, takeUntil} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-landing',
  imports: [
    HeaderComponent,
    FooterComponent,
    HeroComponent,
    AboutComponent,
    GalleryComponent,
    FeaturesComponent,
    LandingDepartmentsComponent,
    ClientsComponent,
    ContactsComponent,
    FaqsComponent,
    OrderPricingComponent,
    FontAwesomeModule,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit, OnDestroy {
  hallName: string | null = null;
  isOrderPricingVisible = false;
  landingPageData!: LandingGeneralInformationDto;
  lang!: string;

  private previousLang: string | null = null;
  private previousDir: string | null = null;
  private unsubscribeAll!: Subject<void>;

  constructor(
    public _landingPageService: LandingPageService,
    private title: Title,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private faviconService: FaviconService,
    private translateService: TranslateService,
  ) {
    this.unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.lang = this.translateService.currentLang;
    this.previousLang = this.document.documentElement.getAttribute('lang');
    this.previousDir = this.document.documentElement.getAttribute('dir');

    this.renderer.setAttribute(this.document.documentElement, 'lang', 'ar');
    this.renderer.setAttribute(this.document.documentElement, 'dir', 'rtl');

    const hallName = this.route.snapshot.paramMap.get('hallName');

    if (hallName) {
      this._landingPageService
        .getLandingPageData(hallName)
        .pipe(takeUntil(this.unsubscribeAll))
        .subscribe((res) => {
          this.landingPageData = res;
          this.setDocumentTitle(this.landingPageData.hall?.name_ar!);
          this.applyHallColors();
          this.faviconService.setFavIcon(this.landingPageData?.hall?.logo_url!);
        });
    }
  }

  setDocumentTitle(hallName: string) {
    this.title.setTitle(hallName);
  }

  applyHallColors() {
    if (!this.landingPageData?.hall) {
      return;
    }

    if (this.landingPageData.hall.primary_color) {
      this.document.documentElement.style.setProperty(
        '--hall-main-color',
        this.landingPageData.hall.primary_color,
      );
    }

    if (this.landingPageData.hall.secondary_color) {
      this.document.documentElement.style.setProperty(
        '--hall-secondary-color',
        this.landingPageData.hall.secondary_color,
      );
    }
  }

  openOrderPricing() {
    this.isOrderPricingVisible = true;
  }

  closeOrderPricing() {
    this.isOrderPricingVisible = false;
  }

  ngOnDestroy(): void {
    if (this.previousLang) {
      this.renderer.setAttribute(
        this.document.documentElement,
        'lang',
        this.previousLang,
      );
    }
    if (this.previousDir) {
      this.renderer.setAttribute(
        this.document.documentElement,
        'dir',
        this.previousDir,
      );
    }

    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }
}

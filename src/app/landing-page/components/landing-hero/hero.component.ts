import {LandingGeneralInformationDto} from '@admin-landing-page/models/landing-page.model';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {SharedModule} from '@shared/shared.module';

@Component({
    selector: 'app-hero',
    imports: [SharedModule],
    templateUrl: './hero.component.html',
    styleUrl: './hero.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HeroComponent implements OnInit {
  @Input() heroData!: LandingGeneralInformationDto;
  @Input() lang!: string;
  @Output() orderPricingRequested = new EventEmitter<void>();

  banners: any;

  activeSection: string = 'home';
  menuItems = [
    {id: 'home', label: 'الرئيسية', contentCheck: () => true},
    {
      id: 'features',
      label: 'المميزات',
      contentCheck: () =>
        this.heroData.sections.find((ele) => ele.type === 'features')?.features
          ?.length,
    },
    {
      id: 'hallDescription',
      label: 'التفاصيل',
      contentCheck: () => true,
    },
    {
      id: 'faqs',
      label: 'الأسئلة الشائعة',
      contentCheck: () =>
        this.heroData.sections.find((ele) => ele.type === 'popularQuestions')
          ?.popularQuestions?.length,
    },
    {id: 'clients', label: 'أراء العملاء', contentCheck: () => false},
    {
      id: 'contact-us',
      label: 'اتصل بنا',
      contentCheck: () => this.heroData?.phone || this.heroData?.email,
    },
  ];

  visibleMenuItems: Array<{id: string; label: string}> = [];

  sanitizedAboutHtml!: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.sanitizedAboutHtml = this.sanitizer.bypassSecurityTrustHtml(
      this.heroData.about!,
    );

    this.visibleMenuItems = this.menuItems.filter((item) =>
      item.contentCheck(),
    );

    this.banners = this.heroData.sections.find(
      (ele) => ele.type === 'banners',
    )?.banners;
  }

  scrollToSection(sectionId: string, event: Event) {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({behavior: 'smooth'});
      this.activeSection = sectionId;
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const sections = this.visibleMenuItems.map((item) => item.id);

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          this.activeSection = section;
          break;
        }
      }
    }
  }

  showOrderPricing() {
    this.orderPricingRequested.emit();
  }
}

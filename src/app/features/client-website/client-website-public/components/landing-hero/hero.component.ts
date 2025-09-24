import {LandingGeneralInformationDto} from '@client-website-admin/models/landing-page.model';
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
      id: 'services',
      label: 'الخدمات',
      contentCheck: () =>
        this.heroData.sections.find((ele) => ele.type === 'services')?.services
          ?.length,
    },
    {
      id: 'images',
      label: 'معرض الصور',
      contentCheck: () =>
        this.heroData.sections.find((ele) => ele.type === 'images')?.images
          ?.length,
    },
    {
      id: 'hallSections',
      label: 'أقسام القاعة',
      contentCheck: () =>
        (this.heroData.sections.find((ele) => ele.type === 'hallSections') as any)?.sections
          ?.length,
    },
    {
      id: 'events',
      label: 'المناسبات',
      contentCheck: () =>
        (this.heroData.sections.find((ele) => ele.type === 'events') as any)?.events
          ?.length,
    },
    {
      id: 'faqs',
      label: 'الأسئلة الشائعة',
      contentCheck: () =>
        this.heroData.sections.find((ele) => ele.type === 'popularQuestions')
          ?.popularQuestions?.length,
    },
    {
      id: 'clients',
      label: 'أراء العملاء',
      contentCheck: () =>
        this.heroData.sections.find((ele) => ele.type === 'customers')?.customers
          ?.length,
    },
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

    // Filter visible menu items
    const filteredItems = this.menuItems.filter((item) =>
      item.contentCheck(),
    );

    // Sort menu items by section order
    this.visibleMenuItems = this.sortMenuItemsByOrder(filteredItems);

    this.banners = this.heroData.sections.find(
      (ele) => ele.type === 'banners',
    )?.banners;
  }

  private sortMenuItemsByOrder(menuItems: Array<{id: string; label: string}>): Array<{id: string; label: string}> {
    // Create a mapping between menu item IDs and section types
    const menuToSectionMap: {[key: string]: string} = {
      'features': 'features',
      'services': 'services',
      'images': 'images',
      'hallSections': 'hallSections',
      'events': 'events',
      'faqs': 'popularQuestions',
      'clients': 'customers'
    };

    return menuItems.sort((a, b) => {
      if (a.id === 'home') return -1;
      if (b.id === 'home') return 1;
      
      if (a.id === 'hallDescription') return 999;
      if (b.id === 'hallDescription') return -999;
      
      if (a.id === 'contact-us') return 1000;
      if (b.id === 'contact-us') return -1000;

      const sectionTypeA = menuToSectionMap[a.id];
      const sectionTypeB = menuToSectionMap[b.id];

      if (!sectionTypeA || !sectionTypeB) return 0;

      const sectionA = this.heroData.sections.find(s => s.type === sectionTypeA);
      const sectionB = this.heroData.sections.find(s => s.type === sectionTypeB);

      if (!sectionA || !sectionB) return 0;

      return sectionA.order - sectionB.order;
    });
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

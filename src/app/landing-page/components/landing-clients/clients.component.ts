import {LandingPageSection} from '@admin-landing-page/models/section.model';

import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  AfterViewInit,
  ElementRef,
  Input,
  OnInit,
} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'app-clients',
  imports: [TranslateModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ClientsComponent implements AfterViewInit, OnInit {
  @Input() section: LandingPageSection | null = null;
  @Input() lang!: string;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const swiperElement = this.elementRef?.nativeElement?.querySelector(
      'swiper-container.swiper2',
    );
    Object.assign(swiperElement, {
      slidesPerView: 2,
      spaceBetween: 10,
      centerInsufficientSlides: true,
      pagination: {
        clickable: true,
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 10,
        },
        577: {
          slidesPerView: 1,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 40,
        },
      },
    });
    swiperElement.initialize();
    if (swiperElement?.shadowRoot) {
      const shadowRoot = swiperElement.shadowRoot;

      const style = document.createElement('style');
      style.textContent = `
            .swiper-pagination-bullet {
              background-color: var(--hall-main-color) !important;
              border-radius: 50% !important;
              width: 8px !important;
              height: 8px !important;
            }
            .swiper-pagination-bullet-active {
              border-radius: 30px !important;
              background-color:var(--hall-main-color) !important;
              width:24px !important;
            }
          `;
      shadowRoot.appendChild(style);
    }
  }
}

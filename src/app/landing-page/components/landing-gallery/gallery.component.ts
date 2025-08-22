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
import {DialogModule} from 'primeng/dialog';

@Component({
  selector: 'app-gallery',
  imports: [TranslateModule, DialogModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GalleryComponent implements OnInit, AfterViewInit {
  @Input() section: LandingPageSection | null = null;
  @Input() lang!: string;

  visible = false;
  selectedImg: string | null = null;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    const swiperElement =
      this.elementRef.nativeElement.querySelector('swiper-container');
    if (swiperElement) {
      Object.assign(swiperElement, {
        slidesPerView: 1,
        spaceBetween: 10,
        pagination: {
          clickable: true,
        },
        breakpoints: {
          320: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          577: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 40,
          },
        },
      });
      swiperElement.initialize();
    }

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
              background-color: var(--hall-main-color) !important;  
              width:24px !important;
            }
          `;
      shadowRoot.appendChild(style);
    }
  }
  openImage(path: string) {
    this.visible = true;
    this.selectedImg = path;
  }
  ngOnInit(): void {}
}

import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {map} from 'rxjs';
import {LandingGeneralInformationDto} from '@admin-landing-page/models/landing-page.model';
import {ApiConfigService} from './api-config.service';

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private apiConfigService: ApiConfigService,
  ) {}

  getLandingPageData(hallName: any) {
    const url = `${this.apiConfigService.getApiBaseUrl('landing-pages')}/public/${hallName}`;

    return this.http.get<LandingGeneralInformationDto>(url);
  }

  getCaptcha() {
    const url = `${this.apiConfigService.getApiBaseUrl('captcha')}`;

    return this.http.get(url).pipe(
      map((response: any) => {
        const cleanSvg = response.svg.replace(/\\/g, '');
        return {
          svg: this.sanitizer.bypassSecurityTrustHtml(cleanSvg),
          captchaId: response.captchaId,
        };
      }),
    );
  }

  submitPricingRequest(data: any) {
    const url = `${this.apiConfigService.getApiBaseUrl('booking-price-requests')}`;

    return this.http.post(url, data);
  }
}

import {Injectable} from '@angular/core';
import {
  CreateQuestionDto,
  LandingGeneralInformationDto,
  LandingPageResponse,
  MediaOrderItem,
  MediaOrderResponse,
  UpdateImagesDto,
  UpdateLandingGeneralInformationsDto,
  UpdateLocationsDto,
  UpdateQuestionDto,
  UpdateSocialLinksDto,
} from '@client-website-admin/models/landing-page.model';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {
  CreateFeatureDto,
  UpdateFeatureDto,
} from '@client-website-admin/models/feature.model';
import {LandingPageServicesDto} from '@client-website-admin/models/service.model';
import {
  CreateLandingPageSectionDto,
  LandingPageSection,
} from '@client-website-admin/models/section.model';
import {ApiConfigService} from '@core/services/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  module = 'landing-pages';
  apiLandingPagesUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient
  ) {}

  addSection({data, landingPageId}: CreateLandingPageSectionDto) {
    return this.http
      .post<any>(`${this.apiLandingPagesUrl}/sections`, {
        landingPageId,
        ...data,
      })
  }

  removeSection(sectionId: number) {
    return this.http
      .delete<LandingPageSection>(
        `${this.apiLandingPagesUrl}/sections/${sectionId}`,
      )
  }

  updateSection(sectionId: number, data: Partial<LandingPageSection>) {
    return this.http
      .patch<any>(`${this.apiLandingPagesUrl}/sections/${sectionId}`, data)
  }

  getLandingPageInformation(
    hallId: number,
  ): Observable<LandingGeneralInformationDto> {
    return this.http.get<LandingGeneralInformationDto>(
      `${this.apiLandingPagesUrl}/${hallId}`,
    );
  }

  saveBasicInformation(
    info: LandingGeneralInformationDto,
  ): Observable<LandingPageResponse> {
    return this.http.post<LandingPageResponse>(this.apiLandingPagesUrl, info);
  }

  updateBasicInformation(
    info: UpdateLandingGeneralInformationsDto,
    landingPageId: number,
  ): Observable<any> {
    return this.http.patch(`${this.apiLandingPagesUrl}/${landingPageId}`, info);
  }

  uploadMedia(
    sectionId: number,
    files: File[],
    type: 'banners' | 'images',
  ): Observable<MediaOrderItem[]> {
    const formData = new FormData();

    formData.append('sectionId', sectionId.toString());

    files.forEach((file) => {
      formData.append('images', file);
    });

    return this.http.post<MediaOrderItem[]>(
      `${this.apiLandingPagesUrl}/${type}`,
      formData,
    );
  }

  updateMediaOrder(
    type: 'banners' | 'images',
    id: number,
    order: number,
  ): Observable<MediaOrderResponse> {
    const payload: UpdateImagesDto = {order};
    return this.http.patch<MediaOrderResponse>(
      `${this.apiLandingPagesUrl}/${type}/${id}`,
      payload,
    );
  }

  deleteMedia(type: 'banners' | 'images', id: number): Observable<any> {
    return this.http.delete(`${this.apiLandingPagesUrl}/${type}/${id}`);
  }

  addFeature(data: CreateFeatureDto): Observable<any> {
    return this.http.post(`${this.apiLandingPagesUrl}/features`, data);
  }

  updateFeature(id: number, data: UpdateFeatureDto): Observable<any> {
    return this.http.patch(`${this.apiLandingPagesUrl}/features/${id}`, data);
  }

  removeFeature(id: number): Observable<any> {
    return this.http.delete(`${this.apiLandingPagesUrl}/features/${id}`);
  }

  addClient(data: FormData): Observable<any> {
    return this.http
      .post(`${this.apiLandingPagesUrl}/customers`, data)
  }

  updateClient(id: number, data: FormData): Observable<any> {
    return this.http
      .patch(`${this.apiLandingPagesUrl}/customers/${id}`, data)
  }

  removeClient(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiLandingPagesUrl}/customers/${id}`)
  }

  updateServices(sectionId: number, services: string[]): Observable<any> {
    const payload: LandingPageServicesDto = {services};

    return this.http.patch(
      `${this.apiLandingPagesUrl}/${sectionId}/services`,
      payload,
    );
  }

  addQuestion(data: CreateQuestionDto): Observable<any> {
    return this.http.post(`${this.apiLandingPagesUrl}/popular-questions`, data);
  }

  updateQuestion(id: number, data: UpdateQuestionDto): Observable<any> {
    return this.http.patch(
      `${this.apiLandingPagesUrl}/popular-questions/${id}`,
      data,
    );
  }

  deleteQuestion(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiLandingPagesUrl}/popular-questions/${id}`,
    );
  }

  updateSocialLinks(
    sectionId: number,
    data: UpdateSocialLinksDto,
  ): Observable<any> {
    return this.http.patch(
      `${this.apiLandingPagesUrl}/${sectionId}/social-links`,
      data,
    );
  }

  updateLocation(
    landingPageId: number,
    data: UpdateLocationsDto,
  ): Observable<any> {
    return this.http.patch(
      `${this.apiLandingPagesUrl}/${landingPageId}/locations`,
      data,
    );
  }
}

import {Feature} from '@client-website-admin/models/feature.model';
import {LandingPageSection} from './section.model';
import {HallSection} from '@halls/models/halls.model';

export interface LandingGeneralInformationDto {
  id?: number;
  hallId?: number | null;
  hallName: string;
  email: string;
  phone: string;
  about?: string;
  location?: any | null;
  mapLocation?: any | null;
  sections: LandingPageSection[];
  hall?: HallDetails;
}

export interface Customer {
  id?: number;
  name: string;
  imagePath?: string;
  imageMimeType?: string;
  site_url: string;
  order: number;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCustomerDto {
  sectionId: number;
  name: string;
  site_url?: string;
  order?: number;
}

export interface UpdateCustomerDto {
  name?: string;
  site_url?: string;
  order?: number;
}

export interface CustomerResponseDto {
  id: number;
  name: string;
  imagePath: string;
  imageMimeType: string;
  site_url: string;
  order: number;
  created_at: string;
  updated_at: string;
}
export interface Client {
  id: number;
  name: string;
  imagePath: string;
  site_url?: string;
  order?: number;
}

export interface BannerItem {
  id: number;
  path: string;
  order: number | null;
  mimetype: string;
}

export interface ImageItem {
  id: number;
  path: string;
  order: number | null;
  mimetype: string;
}

export interface UpdateLandingGeneralInformationsDto {
  hallName?: string;
  email?: string;
  phone?: string;
  about?: string;
}

export interface LandingPageResponse {
  statusCode: number;
  message: string;
  data: LandingGeneralInformationDto;
}

export interface UpdateImagesDto {
  order: number;
}

export interface MediaResponse {
  id: number;
  url: string;
  order: number;
  type: 'banners' | 'images';
}

export interface MediaItem {
  id?: number;
  file: File | null;
  url?: string;
  order?: number | null;
  isUploading?: boolean;
  error?: string;
}

export type MediaType = 'banners' | 'images';

export interface MediaConfig {
  maxItems: number;
  formKey: string;
  translationKey: string;
}

export interface MediaUploadResponse {
  statusCode: number;
  message: string;
  data: MediaResponse;
}

export interface MediaOrderItem {
  id: number;
  created_by: number;
  created_at: string;
  updated_by: null | number;
  updated_at: string;
  deleted_at: null | string;
  deleted: boolean;
  deleted_by: null | number;
  path: string;
  order: number;
  mimetype: string;
}

export type MediaOrderResponse = MediaOrderItem[];

export interface PopularQuestion {
  id?: number;
  question: string;
  answer: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateQuestionDto {
  sectionId: number;
  question: string;
  answer: string;
  order?: number;
}

export interface UpdateQuestionDto {
  question?: string;
  answer?: string;
  order?: number;
}

export interface QuestionResponseDto {
  id: number;
  question: string;
  answer: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  x?: string;
  linkedin?: string;
  snapChat?: string;
  tiktok?: string;
}

export interface LocationInfo {
  location?: string;
  mapLocation?: {
    lat: number;
    long: number;
  };
}

export interface HallEvent {
  name: string;
  name_ar: string;
  description: string;
}

export interface HallDetails {
  id: number;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  name: string;
  name_ar: string;
  description: string | null;
  hallSections: HallSection[];
  totalCapacity: number;
  mensCapacity: number;
  womensCapacity: number;
  hallEvents: HallEvent[];
}

export interface UpdateSocialLinksDto extends SocialLinks {}

export interface UpdateLocationsDto extends LocationInfo {}

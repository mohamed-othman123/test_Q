import {Feature} from './feature.model';
import {
  BannerItem,
  Client,
  Customer,
  ImageItem,
  PopularQuestion,
  SocialLinks,
} from './landing-page.model';
import {FormGroup} from '@angular/forms';

export enum LandingPageSectionType {
  SERVICES = 'services',
  FEATURES = 'features',
  BANNERS = 'banners',
  IMAGES = 'images',
  POPULAR_QUESTION = 'popularQuestions',
  CUSTOMERS = 'customers',
  SOCIAL_LINKS = 'socialLinks',
}

export interface LandingPageSection {
  id: number;
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  type: LandingPageSectionType;
  order: number;
  services?: string[];
  features?: Feature[];
  banners?: BannerItem[];
  images?: ImageItem[];
  popularQuestions?: PopularQuestion[];
  customers?: Customer[];
  socialLinks?: SocialLinks;
  clients?: Client[];
}

export interface CreateLandingPageSectionDto {
  landingPageId: number;
  data: LandingPageSection;
}

export interface SectionTemplate {
  type: LandingPageSectionType;
  label: {en: string; ar: string};
  description: {en: string; ar: string};
  icon: string;
  isEnabled: boolean;
  isExpanded: boolean;
  isEditing: boolean;
  isBasicDetailsExpanded: boolean;
  isEditingBasicDetails: boolean;
  order: number;
  data?: LandingPageSection;
  form?: FormGroup;
}

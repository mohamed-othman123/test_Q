import {Feature} from './feature.model';
import {
  BannerItem,
  Client,
  Customer,
  ImageItem,
  PopularQuestion,
  SocialLinks,
  HallEvent,
} from './landing-page.model';
import {HallSection} from '@halls/models/halls.model';
import {FormGroup} from '@angular/forms';

export enum LandingPageSectionType {
  SERVICES = 'services',
  FEATURES = 'features',
  BANNERS = 'banners',
  IMAGES = 'images',
  POPULAR_QUESTION = 'popularQuestions',
  CUSTOMERS = 'customers',
  SOCIAL_LINKS = 'socialLinks',
  HALL_SECTIONS = 'hallSections',
  EVENTS = 'events',
}

export interface LandingPageSection {
  id: number;
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  type: LandingPageSectionType;
  order: number;
  isActive: boolean;
  services?: string[];
  features?: Feature[];
  banners?: BannerItem[];
  images?: ImageItem[];
  popularQuestions?: PopularQuestion[];
  customers?: Customer[];
  socialLinks?: SocialLinks;
  clients?: Client[];
  sections?: HallSection[];
  events?: HallEvent[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateLandingPageSectionDto {
  landingPageId: number;
  type: LandingPageSectionType;
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateLandingPageSectionDto {
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  order?: number;
  isActive?: boolean;
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

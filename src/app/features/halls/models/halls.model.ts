export enum HallPricingType {
  BOOKING_TIME = 'BOOKING_TIME',
  FIXED = 'FIXED',
  EVENT = 'EVENT',
}

export enum HallPriceCalculationType {
  FIXED_PRICE = 'FIXED_PRICE',
  PER_PERSON = 'PER_PERSON',
  BOOKING_TIME = 'BOOKING_TIME',
}

export enum TeamMemberTypeEnum {
  EMPLOYEE = 'EMPLOYEE',
  THIRD_PARTY = 'THIRD_PARTY',
}

export interface DayPricing {
  morning: number;
  evening: number;
  fullDay: number;
}

export interface HallPricingSchedule {
  saturday: DayPricing;
  sunday: DayPricing;
  monday: DayPricing;
  tuesday: DayPricing;
  wednesday: DayPricing;
  thursday: DayPricing;
  friday: DayPricing;
}

export interface HallSpecialPricing {
  id?: number;
  title?: string;
  startDate: string;
  endDate: string;
  pricing: DayPricing;
}

export interface HallSection {
  id?: number;
  name: string;
  name_ar: string;
  capacity: number;
}

export interface HallTeamMember {
  moderator?: any;
  memberType?: string;
  id?: number;
  name: string;
  email: string;
  phone?: string;
  type?: string;
  occupation?: string;
  employeeId?: number;
  moderatorId?: number;
}

export interface HallReference {
  id?: number;
  name?: string;
}

export interface Hall {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  updated_by: number;
  deleted_by: number;
  deleted_at: string;
  name_ar?: string;
  primary_color: string;
  secondary_color: string;
  description: string;
  sections: HallSection[];
  pricingType: HallPricingType;
  priceCalculationType?: HallPriceCalculationType;
  regularPricing?: HallPricingSchedule;
  specialDaysPricing?: HallSpecialPricing[] | null;
  logo_url: string;
  terms_and_conditions_en?: string;
  terms_and_conditions_ar?: string;
  dailyTempBookings?: number;
  teamMembers?: HallTeamMember[];
  insuranceAmount?: number;
  sendingTime?: string;
  scheduleDays?: number;
  autoCancelDaysTempBookings?: number;
  signatureUrl: string | null;
  stampUrl: string | null;
  documents: HallDocument[];
  signatureName: string;
}

export interface HallDocument {
  id: number;
  name: string;
  name_ar: string;
  firstPartySignature: boolean;
  firstPartyStamp: boolean;
  secondPartySignature: boolean;
}

import {FormControl} from '@angular/forms';
import {Client} from '@clients/models/client.model';
import {Item} from '@core/models';
import {Event} from '@events/models/events.model';
import {
  Hall,
  HallPriceCalculationType,
  HallPricingType,
  HallSection,
} from '@halls/models/halls.model';
import {BookingProcessStatus} from '@orders/enums/orders.enum';
import {HallServiceDetails, Service} from '@services/models';
import {BookingAttachments} from './attachment.model';
import {Discount} from '@discounts/models/discounts.model';

export interface Booking {
  id?: number;
  bookingDate: Date | string; //TODO: to be removed
  isConfirmed: boolean;
  startDate: Date | string | null;
  endDate: Date | string | null;
  eventTime: BookingEventTime;
  bookingReference: string;
  created_at: string;
  created_by: number;
  updated_at: string;
  deleted: boolean;
  deleted_at: string;
  deleted_by: number;
  updated_by: number;
  hall: Hall;
  eventType: Event;
  attendeesType: AttendeesType;
  services: BookingService[];
  notes: string;
  fixedPrice: boolean;
  attendeesNo: number;
  pricePerAttendee: number;
  maleAttendeesCount: number;
  malePricePerAttendee: number;
  femaleAttendeesCount: number;
  femalePricePerAttendee: number;
  fixedBookingPrice: number | null;
  subtotal: number;
  discountPercent: number;
  vat: number;
  totalPayable: number;
  bookingStatus: BookingStatus;
  maleCoordinatorsNo: number;
  femaleCoordinatorsNo: number;
  hijriDate: string; // TODO: to be removed
  startDateHijri: string;
  endDateHijri: string;
  useGregorian: boolean;
  bookingProcessStatus: BookingProcessStatus;
  user: Client;
  numberOfServices: number;
  // contract: Contract;
  paidAmount: number;
  remainingAmount: number;
  attachments: Attachment[];
  insuranceAmount: number;
  discountValue: number;
  discountType: DiscountType;
  specialDiscount: Discount;
  discountDetails: string;
  amountAfterDiscount: number;
  amountAfterVat: number;
  contractPdf?: Pdf;
  invoicePdf?: Pdf;
  sections: HallSection[];
  sectionIds: HallSection[];
  priceCalculationType: HallPriceCalculationType;
  subtotalAfterDisc?: number;
  setFoodTime?: boolean;
  foodTime?: string;
}

export interface Pdf {
  id: number;
  hash: string;
}

export interface Attachment {
  id: number;
  name: string;
  path: string;
  type: string;
}

export interface BookingService {
  id: number;
  price: number;
  name: string;
  name_ar?: string;
  note: null;
  halls: HallServiceDetails[];
}

export enum AttendeesType {
  MEN = 'Men',
  WOMEN = 'Women',
  MEN_AND_WOMEN = 'Men And Women',
}

export enum BookingStatus {
  CONFIRMED = 'Confirmed',
  TEMPORARY = 'Temporary',
}

export enum SelectedDiscountType {
  PERCENT = 'percent',
  FIXED = 'fixed',
  SPECIAL = 'special',
}

export enum DiscountType {
  PERCENT = 'percent',
  FIXED = 'fixed',
}

export enum BookingEventTime {
  MORNING = 'Morning',
  EVENING = 'Evening',
  FULL_DAY = 'Full Day',
}

export interface OrderForm {
  bookingDate: FormControl<Date | string | null>;
  client: FormControl<Client | null>;
  eventType: FormControl<Event | null>;
  attendeesType: FormControl<Item | null>;
  services: FormControl<Service[] | null>;
  notes: FormControl<string | null>;
  fixedPrice: FormControl<boolean | null>;
  attendeesNo: FormControl<string | null>;
  fixedBookingPrice: FormControl<string | null>;
  pricePerAttendee: FormControl<string | null>;
  subtotal: FormControl<string | null>;
  discountValue: FormControl<string | null>;
  discountType: FormControl<DiscountType | null>;
  vat: FormControl<number | null>;
  totalPayable: FormControl<string | null>;
  attachments: FormControl<BookingAttachments[] | null>;
  insuranceAmount: FormControl<string | null>;
}

export type BookingDetails = Booking & {
  address: string;
  client: Client;
  services: (BookingService | Service)[];
};

export interface BookingAvailability {
  hallId?: number;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface BookingPrice {
  hallId: number;
  startDate: string;
  endDate: string;
  eventTime: string;
  [key: string]: any;
}

export interface BookingPriceResponse {
  insuranceAmount: number;
  priceCalculationType: HallPriceCalculationType;
  pricingType: HallPricingType;
  totalAmount: number;
  totalAmountMen: number;
  totalAmountWomen: number;
}

export interface BookingAvailabilityData {
  morning: {
    temp: number;
    confirmed: number;
  };
  evening: {
    temp: number;
    confirmed: number;
  };
  fullDay: {
    temp: number;
    confirmed: number;
  };
}

export interface BookingOverlap {
  startDate: string;
  endDate: string;
  eventTime: BookingEventTime;
  hallId: number;
  sectionIds: string;
  bookingId?: number;
}

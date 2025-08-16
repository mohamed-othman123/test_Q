import {BookingProcessStatus} from '@orders/enums/orders.enum';

export interface EventType {
  id: number;
  name: string;
  name_ar?: string;
}

export interface User {
  id: number;
  name: string;
}

export interface CalendarBooking {
  id: number;
  bookingDate: string;
  startDate: string;
  endDate: string;
  eventType: EventType;
  eventTime: string;
  user: User;
  bookingProcessStatus: BookingProcessStatus;
}

export interface CalendarResponse {
  [key: string]: CalendarBooking[];
}

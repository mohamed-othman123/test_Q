import {BookingProcessStatus} from '@orders/enums/orders.enum';

export interface KeyMetrics {
  occupancyRate: number;
  totalBookings: number;
  totalExpenses: number;
  totalNet: number;
  totalRevenue: number;
  totalTax: number;
}

export interface ChartData {
  hall_id: number;
  period: Date;
  number_of_bookings?: number;
  totalRevenue: number;
  totalExpenses: number;
  totalBookings: number;
  interval_type: string;
  month_number: number;
  week_number: number;
}

export interface UpcomingBooking {
  id: number;
  startDate: string;
  endDate: string;
  bookingProcessStatus: BookingProcessStatus;
  userName: string;
  userPhone: string;
  userEmail: string;
  isVIB: boolean;
  userType?: string;
  userGender?: string;
}

export interface UpcomingBookingHijriDate {
  startDate: string;
  endDate: string;
}

export interface ReservedBookings {
  hall_id: number;
  booking_date: Date;
  booking_year: number;
  booking_month: number;
  booking_day: number;
  hijri_date: string;
}

export interface DashboardPayment {
  hall_id: number;
  client_id: number;
  paymentAmount: number;
  paymentDate: Date;
  paymentId: number;
  paymentName: string;
  paymentType?: string;
  source: string;
}

export interface DashboardResolvedData {
  keyMetrics: KeyMetrics;
  upcomingBooking: UpcomingBooking[];
  reservedBookings: ReservedBookings[];
  // payments: DashboardPayment[];
  chartData: ChartData[];
}

export interface customizeDate {
  fromDate: string;
  toDate: string;
}

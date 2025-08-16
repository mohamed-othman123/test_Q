export interface PriceRequest {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  eventName: string;
  eventDate: string | null;
  eventDateHijri: string;
  isFlexibleDate: boolean;
  message: string;
  status: PriceRequestStatus;
  notes: string;
  created_at: string;
  eventTime: string;
}

export enum PriceRequestStatus {
  New = 'New',
  InProgress = 'In Progress',
  NotAnswered = 'Not Answered',
  Completed = 'Completed',
  Canceled = 'Canceled',
}

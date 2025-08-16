export interface ContractInfo {
  customerSignature: string | null;
  customerSignatureName: string | null;
  owner: {
    id: number;
    created_by: number | null;
    created_at: string;
    updated_by: number | null;
    updated_at: string;
    deleted_at: string | null;
    deleted: boolean;
    deleted_by: number | null;
    name: string;
    email: string;
    phone: string;
    address: string;
    taxRegistrationNumber: string;
    commercialRegistrationNumber: string;
    website: string;
    endDate: string;
  };
  services: Array<{
    // Define service properties here if you have them, left as any for now
    [key: string]: any;
  }>;
  hall: {
    id: number;
    name: string;
    name_ar: string;
    logo_url: string;
    primary_color: string;
    secondary_color: string;
  };
  sections: Array<{
    id: number;
    name: string;
    name_ar: string;
  }>;
  customer: {
    name: string;
    email: string;
    phone: string;
    type: string;
    address: string | null;
    company_details: {
      commercialRegistrationNumber?: string;
      taxRegistrationNumber?: string;
      [key: string]: any;
    } | null;
  };
  event: {
    id: number;
    name: string;
    name_ar: string;
  };
  bookingReference: string;
  contractSetting: {
    id: number;
    terms_and_conditions_ar: string;
    terms_and_conditions_en: string;
    firstPartySignature: boolean;
    signatureUrl: string | null;
    signatureName: string | null;
    firstPartyStamp: boolean;
    stampUrl: string | null;
    secondPartySignature: boolean;
    attachments: Array<any>;
  };
  startDate: string;
  endDate: string;
  eventTime: string;
  maleAttendeesCount: number;
  femaleAttendeesCount: number;
  attendeesType: string;
  isConfirmed: boolean;
  notes: string | null;
  paymentDetails: {
    malePricePerAttendee: number;
    femalePricePerAttendee: number;
    priceCalculationType: string;
    fixedBookingPrice: number;
    subtotal: number;
    discountType: string;
    discountValue: number;
    subtotalAfterDisc: number;
    vat: number;
    insuranceAmount: number;
    totalPayable: number;
  };
  payments: Array<{
    id: number;
    deleted: boolean;
    paymentType: string;
    amount: number;
  }>;
  created_at: string;
}

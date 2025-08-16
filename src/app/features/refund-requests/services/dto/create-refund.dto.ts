export interface CreateRefundRequestDto {
  bookingId: number;
  hallId: number;
  amount: number;
  beneficiaryName: string;
  beneficiaryMobile: string;
  paymentMethodId: number;
  requestDate: string;
  notes?: string;
  beneficiaryType: string;
  clientPaymentMethod: {
    accountNumber: string;
    bankName: string;
    ewalletMobile: string;
    ewalletName: string;
    iban: string;
    type: string;
  };
}

export interface UpdateClientPaymentMethodDto {
  type: string;
  receiverName?: string;
  bankName?: string;
  accountNumber?: string;
  iban?: string;
  ewalletName?: string;
  mobile?: string;
}

export interface UpdateRefundRequestDto {
  paymentMethodId?: number;
  status?: string;
  notes?: string;
  amount?: number;
  clientPaymentMethod?: UpdateClientPaymentMethodDto;
  rejectReason?: string;
}

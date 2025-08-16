export interface HallContract {
  id: number;
  terms_and_conditions_en: string;
  terms_and_conditions_ar: string;
  title_en?: string;
  title_ar?: string;
  customerType: string;
  firstParty: boolean;
  secondParty: boolean;
  secondPartySignature: boolean | null;
  firstPartySignature: boolean | null;
  firstPartyStamp: boolean | null;
  created_at: string;
  updated_at: string;
  hall: {
    id: number;
    name?: string;
    name_ar?: string;
  };
  event: {
    id: number;
    name?: string;
    name_ar?: string;
  };
}

export interface ContractDTO {
  eventId: number;
  customerType: string;
  terms_and_conditions_en?: string | null;
  terms_and_conditions_ar?: string | null;
}

export interface CreateContractRequest {
  contractsInfo: ContractDTO[];
  firstPartyStamp?: boolean | null;
  firstPartySignature?: boolean | null;
  secondPartySignature?: boolean | null;
}

export interface UpdateContractRequest {
  terms_and_conditions_en?: string | null;
  terms_and_conditions_ar?: string | null;
  firstPartyStamp?: boolean | null;
  firstPartySignature?: boolean | null;
  secondPartySignature?: boolean | null;
}

export type CustomerType = 'Individual' | 'Facility' | 'Governmental Facility';

export interface CustomerTypeOption {
  id: string;
  name: string;
  name_ar: string;
}

export const CUSTOMER_TYPES: CustomerTypeOption[] = [
  {id: 'Individual', name: 'Individual', name_ar: 'فرد'},
  {id: 'Facility', name: 'Facility', name_ar: 'منشأة'},
  {
    id: 'Governmental Facility',
    name: 'Governmental Facility',
    name_ar: 'منشأة حكومية',
  },
];

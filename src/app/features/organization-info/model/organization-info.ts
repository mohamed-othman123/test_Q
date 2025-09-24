import {Address} from '@core/interfaces/address';

export interface OrganizationInfo {
  name: string;
  phone: string;
  taxRegistrationNumber: number;
  commercialRegistrationNumber: number;
  address: Address;
  category: string;
  isZatcaConnected: boolean;
}

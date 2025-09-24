import {Address} from '../interfaces/address';

export function formatAddress(address: Address): string {
  const parts = [
    address.city,
    address.district,
    address.street,
    address.buildingNumber,
    address.unitNumber ? `${address.unitNumber}` : '',
    address.additionalNumber ? `${address.additionalNumber}` : '',
    address.postalCode,
  ].filter(Boolean);

  return parts.join(', ');
}

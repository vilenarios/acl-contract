import { AccessControl } from './contracts/types/types';

declare const ContractError;

export function isArweaveAddress(address: string) {
  const trimmedAddress = address.toString().trim();
  if (!/[a-z0-9_-]{43}/i.test(trimmedAddress)) {
    throw new ContractError('Invalid Arweave address.');
  }
  return trimmedAddress;
}

// Returns true if a given permission is active
export function isActiveAccessControl(accessControl: AccessControl[]): boolean {
  for (let i = 0; i < accessControl.length; i += 1) {
    if (accessControl[i].end === 0) {
      return true;
    }
  }
  return false;
}

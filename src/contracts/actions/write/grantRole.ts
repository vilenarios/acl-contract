import {
  DEFAULT_INVALID_ROLE_MESSAGE,
  DEFAULT_INVALID_PERMISSIONS_MESSAGE,
  WALLET_LENGTH,
  DEFAULT_INVALID_TARGET_MESSAGE,
} from '@/constants';

import { ContractResult, DriveConfigState, PstAction } from '../../types/types';

declare const ContractError;
declare const SmartWeave: any;

// Modifies the fees for purchasing ArNS names
export const grantRole = async (
  state: DriveConfigState,
  { caller, input: { target, roleName } }: PstAction,
): Promise<ContractResult> => {
  const owner = state.owner;
  const acl = state.acl;
  const roles = state.roles;
  let hasPermissions = false;

  // Is this a valid role?
  if (!(roleName in roles)) {
    throw new ContractError(DEFAULT_INVALID_ROLE_MESSAGE);
  }

  // Is this a valid target?
  if (
    typeof target !== 'string' 
  ) {
    throw new ContractError(DEFAULT_INVALID_TARGET_MESSAGE);
  }

  // Does the uesr calling this have the ability to manage permissions?
  if (caller === state.owner) {
    hasPermissions = true;
  } else if (caller in acl) {
    for (let i = 0; i < acl[caller].length; i+=1) {
      if (acl[caller][i].permission === "manage_permissions" && acl[caller][i].end === 0) {
        hasPermissions = true;
      }
    }
  }
  if (hasPermissions === false) {
    throw new ContractError(DEFAULT_INVALID_PERMISSIONS_MESSAGE);
  }

  if (target in acl) {

  } else {
    acl[target] = []
    for (let i=0; i < roles[roleName].permissions.length; i+=1) {
      acl[target].push(roles[roleName].permissions[i])

      
    }

    permission: Permission, // the permssion given to this identity
    start: number, // the block height this access control was granted.
    end: number, // the block height this access control ends.
    modifiedBy: string // the identity that last modified this access control

    acl[target] = [{
      permission:

    }]
  }



  return { state };
};

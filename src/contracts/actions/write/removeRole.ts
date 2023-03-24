import {
  DEFAULT_INVALID_PERMISSIONS_MESSAGE,
  DEFAULT_INVALID_ROLE_MESSAGE,
  DEFAULT_INVALID_TARGET_MESSAGE,
} from '@/constants';

import { ContractResult, DriveConfigState, PstAction } from '../../types/types';

declare const ContractError;
declare const SmartWeave: any;

// Removes all user permissions associated with a role
export const removeRole = async (
  state: DriveConfigState,
  { caller, input: { target, roleName } }: PstAction,
): Promise<ContractResult> => {
  const acl = state.acl;
  const roles = state.roles;
  let hasPermissions = false;

  // Is this a valid role?
  if (!(roleName in roles)) {
    throw new ContractError(DEFAULT_INVALID_ROLE_MESSAGE);
  }

  // Is this a valid target?
  if (typeof target !== 'string' || target === caller) {
    throw new ContractError(DEFAULT_INVALID_TARGET_MESSAGE);
  }

  // Does the user calling this have the ability to manage permissions?
  if (caller === state.owner) {
    hasPermissions = true;
  } else if (caller in acl) {
    for (let i = 0; i < acl[caller].length; i += 1) {
      if (
        acl[caller][i].permission === 'managePermissions' &&
        acl[caller][i].end === 0
      ) {
        hasPermissions = true;
      }
    }
  }
  if (hasPermissions === false) {
    throw new ContractError(DEFAULT_INVALID_PERMISSIONS_MESSAGE);
  }

  // The user must already be in the ACL to remove access controls.
  if (target in acl) {
    for (let i = 0; i < roles[roleName].permissions.length; i += 1) {
      for (let n = 0; n < acl[target].length; n += 1) {
        if (
          acl[target][n].permission === roles[roleName].permissions[i] &&
          acl[target][n].end !== 0
        ) {
          // Put an endling block date on this access control
          acl[target][n].end = +SmartWeave.block.height;
          acl[target][n].modifiedBy = caller;
        } else {
          // Skip this access control as it has already ended for the user
          n = acl[target].length;
        }
      }
    }
  } else {
    // This user has no access controls, so there is nothing to remove
    throw new ContractError(DEFAULT_INVALID_TARGET_MESSAGE);
  }

  return { state };
};

import {
  DEFAULT_INVALID_PERMISSIONS_MESSAGE,
  DEFAULT_INVALID_ROLE_MESSAGE,
  DEFAULT_INVALID_TARGET_MESSAGE,
  MANAGE_PERMISSIONS,
} from '@/constants';
import { isActiveAccessControl } from '@/utilities';

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
    // this user has the ability to manage permissions
  } else if (MANAGE_PERMISSIONS in acl[caller]) {
    if (!isActiveAccessControl(acl[caller][MANAGE_PERMISSIONS])) {
      throw new ContractError(DEFAULT_INVALID_PERMISSIONS_MESSAGE);
    } else {
      // this user has the ability to manage permissions
    }
  } else {
    throw new ContractError(DEFAULT_INVALID_PERMISSIONS_MESSAGE);
  }

  // The user must already be in the ACL to remove access controls.
  if (target in acl) {
    // Check each permission in the role that is to be removed
    for (let i = 0; i < roles[roleName].permissions.length; i += 1) {
      if (roles[roleName].permissions[i] in acl[target]) {
        // The user has this permission so we must set all active permissions to inactive by modifying the block height end
        for (
          let n = 0;
          n < acl[target][roles[roleName].permissions[i]].length;
          n += 1
        ) {
          if (acl[target][roles[roleName].permissions[i]][n].end === 0) {
            acl[target][roles[roleName].permissions[i]][n].end =
              +SmartWeave.block.height;
            acl[target][roles[roleName].permissions[i]][n].modifiedBy = caller;
          }
        }
      }
    }
  } else {
    // This user has no access controls, so there is nothing to remove
    throw new ContractError(DEFAULT_INVALID_TARGET_MESSAGE);
  }

  return { state };
};

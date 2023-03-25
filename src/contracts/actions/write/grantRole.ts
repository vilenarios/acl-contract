import {
  DEFAULT_INVALID_PERMISSIONS_MESSAGE,
  DEFAULT_INVALID_ROLE_MESSAGE,
  DEFAULT_INVALID_TARGET_MESSAGE,
} from '@/constants';

import {
  ContractResult,
  DriveConfigState,
  Permission,
  PstAction,
} from '../../types/types';

declare const ContractError;
declare const SmartWeave: any;

// Modifies the fees for purchasing ArNS names
export const grantRole = async (
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

  // Does this user already have any ACLs? If so, lets update them
  if (target in acl) {
    for (let i = 0; i < roles[roleName].permissions.length; i += 1) {
      if (roles[roleName].permissions[i] in acl[target]) {
        // The user has this permission already.  Is it active?
        if (acl[target][roles[roleName].permissions[i]].end === 0) {
          // This is an inactive permission
        } 



      for (let n = 0; n < acl[target].length; n += 1) {
        if (
          roles[roleName].permissions.includes(acl[target][n].permission) &&
          acl[target][n].end === 0
        ) {
          // The user already has this permission
          n = acl[target].length;
        } else {
          // Grant this user the permission
          acl[target].push({
            permission: roles[roleName].permissions[i],
            start: +SmartWeave.block.height,
            end: 0, // end of 0 means this is an active permissions and there is no end block height
            modifiedBy: caller,
          });
        }
      }
    }
  } else {
    // The user has no ACLs, so lets create their first one
    acl[target] = [];
    for (let i = 0; i < roles[roleName].permissions.length; i += 1) {
      acl[target][roles[roleName].permissions[i]] = {
        start: +SmartWeave.block.height,
        end: 0, // end of 0 means this is an active permissions and there is no end block height
        modifiedBy: caller,
      };
    }
  }

  return { state };
};

import { DEFAULT_INVALID_TARGET_MESSAGE } from '@/constants';
import { ContractResult, DriveConfigState, PstAction } from '../../types/types';

declare const ContractError;

export const getUserACL = async (
  state: DriveConfigState,
  { input: { target } }: PstAction,
): Promise<ContractResult> => {
  const acl = state.acl;

  // Is this a valid target?
  if (
    typeof target !== 'string' || !(target in acl)
  ) {
    throw new ContractError(DEFAULT_INVALID_TARGET_MESSAGE);
  }

  const targetAcl = acl[target]

  return {
    aclResult: {
      target,
      targetAcl
    }
  };
};

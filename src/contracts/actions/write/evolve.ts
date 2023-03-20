import { DEFAULT_NON_CONTRACT_OWNER_MESSAGE } from '@/constants.js';

import { ContractResult, DriveConfigState, PstAction } from '../../types/types';

declare const ContractError;

// Updates this contract to new source code
export const evolve = async (
  state: DriveConfigState,
  { caller, input: { value } }: PstAction,
): Promise<ContractResult> => {
  const owner = state.owner;

  if (caller !== owner) {
    throw new ContractError(DEFAULT_NON_CONTRACT_OWNER_MESSAGE);
  }

  // TODO: regex on the string
  state.evolve = value.toString();

  return { state };
};

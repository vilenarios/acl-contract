import { evolve } from './actions/write/evolve';
import { grantRole } from './actions/write/grantRole';
import { removeRole } from './actions/write/removeRole';
import {
  ContractResult,
  DriveConfigState,
  PstAction,
  PstFunction,
} from './types/types';

declare const ContractError;

export async function handle(
  state: DriveConfigState,
  action: PstAction,
): Promise<ContractResult> {
  const input = action.input;

  switch (input.function as PstFunction) {
    // TODO: Add support for custom permissions
    // case 'grantPermission':
    //    return await grantPermission(state, action);
    //  case 'removePermission':
    //    return await removePermission(state, action);
    case 'removeRole':
      return await removeRole(state, action);
    case 'grantRole':
      return await grantRole(state, action);
    case 'evolve':
      return await evolve(state, action);
    default:
      throw new ContractError(
        `No function supplied or function not recognized: "${input.function}"`,
      );
  }
}

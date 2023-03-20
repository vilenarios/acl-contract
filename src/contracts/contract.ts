import { ContractResult, DriveConfigState, PstAction, PstFunction } from './types/types';

declare const ContractError;

export async function handle(
  state: DriveConfigState,
  action: PstAction,
): Promise<ContractResult> {
  const input = action.input;

  switch (input.function as PstFunction) {
    // TODO: Add support for custom permissions
    // case 'createPermission':
    //    return await createPermission(state, action);
    //  case 'removePermission':
    //    return await removePermission(state, action);
    case 'createRole':
      return await createRole(state, action);
    case 'removeRole':
      return await removeRole(state, action);
    case 'grantRole':
      return await grantRole(state, action);
    case 'removeUser':
      return await removeUser(state, action);
    default:
      throw new ContractError(
        `No function supplied or function not recognized: "${input.function}"`,
      );
  }
}

import { PstState } from 'warp-contracts';

export type DriveConfigState = PstState & {
  owner: string; // The owner of the drive
  name: string; // The entity name (eg drive name, folder name, file name) plus 'Access Control List'
  ticker: string; // 9 character, all caps as ACL-ID where ID is the first 4 characters of the entity id
  entity: ArFSEntity; // The related arfs entity, like a drive, folder or file
  permissions: Permission[]; // All permissions available
  roles: {
    [name: string]: Role; // A role is a grouping of permissions that can be given to a user
  };
  acl: {
    [identity: string]: AccessControls; // A list of all role based access given to a user
  };
  evolve: string; // The new Smartweave Source Code transaction to evolve this contract to
};

export type AccessControls = {
  [permissionName: string]: AccessControl[];
};

export type AccessControl = {
  start: number; // the block height this access control was granted.
  end: number; // the block height this access control ends.
  modifiedBy: string; // the identity that last modified this access control
};

export type Permission =
  | 'viewItems'
  | 'viewVersions'
  | 'writeFiles'
  | 'createFolders'
  | 'modifyItems'
  | 'managePermissions';

export type Role = {
  description: string; // A short, 256 character max description of the role
  permissions: Permission[]; // A list of all permissions this role has
};

export type ArFSEntity = {
  id: string;
  type: 'drive' | 'folder' | 'file';
};

export type PstAction = {
  input: PstInput;
  caller: string;
};

export type PstInput = {
  function: PstFunction;
  entityId: string;
  target: string;
  roleName: string;
  permission: Permission;
  value: string | number;
};

export type AclResult = {
  target: string;
  targetAcl: AccessControl[];
};

export type PstFunction =
  | 'grantPermission'
  | 'removePermission'
  | 'grantRole'
  | 'removeRole'
  | 'evolve';

export type ContractResult =
  | { state: DriveConfigState }
  | { aclResult: AclResult };

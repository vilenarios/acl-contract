export type DriveConfigState = {
  owner: string; // The owner of the drive
  arfsEntity: ArFSEntity; // The related arfs entity, like a drive, folder or file
  permissions: Permission[]; // An array of all permissions available
  evolve: string; // The new Smartweave Source Code transaction to evolve this contract to
  roles: {
    [roleName: string]: Role;
  };
  acl: {
      [identity: string]: AccessControl[];
  };
};

export type AccessControl = {
  role: Role,
  start: number,
  end: number,
}

export enum Permission {
  ViewItems = "view_items",
  ViewVersions = "view_versions",
  WriteFiles = "write_files",
  CreateFolders = "create_folders",
  ModifyItems = "modify_items",
  ManagePermissions = "manage_permissions",
}

export type Role = {
  description: string;
  permissions: Permission[];
}

export type PstAction = {
  input: PstInput;
  caller: string;
};

export type ArFSEntity = {
  id: string;
  type: 'drive' | 'folder' | 'file';
}

export type PstInput = {
  function: PstFunction;
  driveId: string;
  target: string;
  permission: Permission;
  value: string | number;
};

export type PstResult = {
  target: string;
  balance: number;
};

// TODO: handle purchasing additional undernames
export type PstFunction =
  | 'addPermission'
  | 'removePermission'
  | 'createRole'
  | 'removeRole'
  | 'addUser'
  | 'removeUser'

export type ContractResult =
  | { state: DriveConfigState }
  | { result: PstResult }

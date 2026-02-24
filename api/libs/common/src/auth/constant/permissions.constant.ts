export const METADATA_PERMISSIONS = 'METADATA_PERMISSIONS';

// CONVENTION: module:action.
export const PERMISSIONS = {
  organizationRead: 'organization:read',
  organizationUpdate: 'organization:update',
  organizationUploadDocuments: 'organization:upload_documents',
  organizationListDocuments: 'organization:list_documents',
  organizationGetDocument: 'organization:get_document',
  organizationDeleteDocument: 'organization:delete_document',

  usersRead: 'users:read',
  usersReadDetails: 'users:read_detail',
  usersCreate: 'users:create',
  usersActivation: 'users:activation',
  usersChangePassword: 'users:change_password',
  usersSetPermissions: 'users:set_permissions',
  usersReadPermissions: 'users:read_permissions',
  usersUpdate: 'users:update',
  usersUpdateCredentials: 'users:update_credentials',
  usersDelete: 'users:delete',
  usersUploadDocuments: 'users:upload_documents',
  usersListDocuments: 'users:list_documents',
  userGetDocument: 'users:get_document',
  userDeleteDocument: 'users:delete_document',

  equipmentRead: 'devices:read',
  equipmentReadDetails: 'devices:read_detail',
  equipmentCreate: 'devices:create',
  equipmentUpdate: 'devices:update',
  equipmentDelete: 'devices:delete',
  equipmentUploadDocuments: 'devices:upload_documents',
  equipmentListDocuments: 'devices:list_documents',
  equipmentGetDocument: 'devices:get_document',
  equipmentDeleteDocument: 'devices:delete_document',

  endowmentsUploadDocuments: 'endowments:upload_documents',
  endowmentsListDocuments: 'endowments:list_documents',
  endowmentsGetDocument: 'endowments:get_document',
  endowmentsDeleteDocument: 'endowments:delete_document',
} as const;

export const PERMISSIONS_VALUES = Object.values(PERMISSIONS);

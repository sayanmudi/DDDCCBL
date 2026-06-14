export function getRoleAccess(role: string) {
  switch (role) {
    case 'Admin':
      return ['Admin', 'Manager', 'Supervisor','Teller', 'PACS'];
    case 'Manager':
      return ['Manager', 'Supervisor','Teller', 'PACS'];
    case 'Supervisor':
      return ['Supervisor','Teller', 'PACS'];
    case 'Teller':
      return ['Teller', 'PACS'];
    case 'PACS':
      return ['PACS'];
    default:
      return [role];
  }
}

export function hasAccess(role: string, access: string[] = []) {
  if (access.includes('All')) {
    return true;
  }

  return getRoleAccess(role).some((allowedRole) => access.includes(allowedRole));
}

export function getAccessibleSubMenus(role: string, subMenus: any[] = []) {
  return subMenus?.filter((submenu) => hasAccess(role, submenu.access)) ?? [];
}

export function canChangeBranchCode(role: string) {
  return role === 'Admin';
}

export function canChangeUserRole(role: string) {
  return role === 'Admin';
}

export function canResetPasswordFor(viewerRole: string, targetRole: string) {
  if (viewerRole === 'Admin') return true;
  if (viewerRole === 'Manager') {
    return targetRole === 'Supervisor' || targetRole === 'Teller' || targetRole === 'PACS';
  }
  if (viewerRole === 'Supervisor') {
    return targetRole === 'PACS';
  }
  return false;
}

export function canManageUsersPage(role: string) {
  return role === 'Admin' || role === 'Manager' || role === 'Supervisor';
}

export function getRoleAccess(role: string) {
  switch (role) {
    case 'Admin':
      return ['Admin', 'Manager', 'Teller'];
    case 'Manager':
      return ['Manager', 'Teller'];
    case 'Supervisor':
      return ['Supervisor', 'Manager', 'Teller'];
    case 'Teller':
      return ['Teller'];
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

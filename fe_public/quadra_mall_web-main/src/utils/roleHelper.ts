export const hasRole = (user: any, roleName: string): boolean => {
  if (!user || !user.roles) return false;
  
  return user.roles.some((role: any) => 
    role.name === roleName || role.name === `ROLE_${roleName}`
  );
};

export const getRoleNames = (user: any): string[] => {
  if (!user || !user.roles) return [];
  
  return user.roles.map((role: any) => role.name);
};
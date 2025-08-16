import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {PermissionsService} from '@core/services/permissions.service';

export const permissionsGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const permissionService = inject(PermissionsService);

  const permissionsArray = route.data['permissions'];

  if (!permissionsArray.length) {
    router.navigateByUrl('/forbidden');
    return false;
  }

  permissionService.reloadPermissions();

  const permissions = permissionsArray
    .map((permission: string) => {
      return permissionService.getPermissionsForModule(permission);
    })
    .flat();

  if (permissions.length > 0) {
    return true;
  } else {
    router.navigateByUrl('/forbidden');
    return false;
  }
};

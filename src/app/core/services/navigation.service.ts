import {Injectable} from '@angular/core';
import {Permission} from '@auth/models';
import {NAV_ITEMS} from '@core/constants';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  /**
   * Returns the first route path the user can access,
   * or '/dashboard' if none match.
   */
  getFirstAccessibleRoute(userPermissions: Permission[]): string {
    const keys = userPermissions.map((p) => p.en_name);

    const match = NAV_ITEMS.find((item) => keys.includes(item.permission));

    return match ? match.path : '/dashboard';
  }
}

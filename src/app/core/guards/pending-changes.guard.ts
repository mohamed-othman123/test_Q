// import {Injectable} from '@angular/core';
// import {CanDeactivate} from '@angular/router';
// import {Observable, Subject} from 'rxjs';
//
// export interface CanComponentDeactivate {
//   canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
//   prepareForNavigation?: () => void;
// }
//
// @Injectable({
//   providedIn: 'root',
// })
// export class PendingChangesGuard
//   implements CanDeactivate<CanComponentDeactivate>
// {
//   private static navigationApproved = new Subject<boolean>();
//
//   canDeactivate(
//     component: CanComponentDeactivate,
//   ): Observable<boolean> | Promise<boolean> | boolean {
//     if (!component.canDeactivate) {
//       return true;
//     }
//
//     if (component.prepareForNavigation) {
//       component.prepareForNavigation();
//     }
//
//     const result = component.canDeactivate();
//
//     if (typeof result === 'boolean' && result) {
//       return true;
//     }
//
//     return PendingChangesGuard.navigationApproved.asObservable();
//   }
// }

import {Injectable} from '@angular/core';
import {CanDeactivateFn} from '@angular/router';
import {Observable} from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
  prepareForNavigation?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class PendingChangesGuard {
  canDeactivate: CanDeactivateFn<CanComponentDeactivate> = (
    component: CanComponentDeactivate,
  ): Observable<boolean> | Promise<boolean> | boolean => {
    if (!component.canDeactivate) {
      return true;
    }

    if (component.prepareForNavigation) {
      component.prepareForNavigation();
    }

    return component.canDeactivate();
  };
}

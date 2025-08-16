import {Injectable} from '@angular/core';
import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import {Service} from '@services/models';
import {ServicesService} from '@services/services/services.service';
import {catchError, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServicesResolver implements Resolve<Service | null> {
  constructor(
    private router: Router,
    private servicesService: ServicesService,
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<Service | null> {
    const serviceId = route.paramMap.get('id');

    if (serviceId) {
      return this.servicesService.getServiceById(+serviceId).pipe(
        catchError(() => {
          this.router.navigate(['/services']);
          return of(null);
        }),
      );
    }

    return of(null);
  }
}

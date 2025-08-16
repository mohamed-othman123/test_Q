import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventBusService {
  private permissionsUpdated = new Subject<void>();

  permissionsUpdated$ = this.permissionsUpdated.asObservable();

  announcePermissionsUpdated() {
    this.permissionsUpdated.next();
  }
}

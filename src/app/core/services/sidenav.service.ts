import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidenavService {
  constructor() {}

  private _showSideNav = new BehaviorSubject(false);

  public isVisibleSideNav = this._showSideNav.asObservable();

  showSideNav() {
    this._showSideNav.next(true);
  }

  hideSideNav() {
    this._showSideNav.next(false);
  }
  toggleSideNav() {
    this._showSideNav.value
      ? this._showSideNav.next(false)
      : this._showSideNav.next(true);
  }
}

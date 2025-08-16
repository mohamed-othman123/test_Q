import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private isVisible = new BehaviorSubject(false);

  public isVisible$ = this.isVisible.asObservable();

  constructor() {}

  showLoader() {
    this.isVisible.next(true);
  }

  hideLoader() {
    this.isVisible.next(false);
  }
}

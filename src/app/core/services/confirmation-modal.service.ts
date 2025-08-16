import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

type ConfirmationMode = 'add' | 'edit' | 'print';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationModalService {
  private displayModal = new BehaviorSubject<boolean>(false);
  private modalResponse = new BehaviorSubject<boolean | null>(null);
  mode = new BehaviorSubject<ConfirmationMode>('add');

  show(mode: ConfirmationMode): Observable<boolean> {
    this.mode.next(mode);
    this.displayModal.next(true);
    return new Observable<boolean>((observer) => {
      const subscription = this.modalResponse.subscribe((response) => {
        if (response !== null) {
          observer.next(response);
          observer.complete();
          this.modalResponse.next(null);
          this.displayModal.next(false);
          subscription.unsubscribe();
        }
      });
    });
  }

  confirm() {
    this.modalResponse.next(true);
  }

  reject() {
    this.modalResponse.next(false);
  }

  close() {
    this.displayModal.next(false);
    this.modalResponse.next(null);
  }

  get display$() {
    return this.displayModal.asObservable();
  }
}

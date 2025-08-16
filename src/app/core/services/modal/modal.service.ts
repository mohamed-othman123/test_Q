import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private modals: Map<string, BehaviorSubject<boolean>> = new Map<string, BehaviorSubject<boolean>>();

  openModal(modalId: string) {
    if (!this.modals.has(modalId)) {
      this.modals.set(modalId, new BehaviorSubject<boolean>(false));
    }
    this.modals.get(modalId)?.next(true);
  }

  closeModal(modalId: string) {
    if (this.modals.has(modalId)) {
      this.modals.get(modalId)?.next(false);
    }
  }

  isOpen$(modalId: string) {
    return this.modals.has(modalId) ? this.modals.get(modalId)?.asObservable() : new BehaviorSubject<boolean>(false).asObservable();
  }


  constructor() { }
}

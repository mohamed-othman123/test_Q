import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

export interface TabState {
  index: number;
  title: string;
  dirty: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FormStateService {
  private tabStates = new BehaviorSubject<TabState[]>([]);
  private ignoreTabChanges: boolean = false;

  private resetEvent = new Subject<number>();

  initTabStates(tabs: {title: string; icon: string}[]): void {
    const initialStates = tabs.map((tab, index) => ({
      index,
      title: tab.title,
      dirty: false,
    }));
    this.tabStates.next(initialStates);
  }

  markTabAsDirty(tabIndex: number): void {
    if (this.ignoreTabChanges) {
      return;
    }

    if (tabIndex < 0 || isNaN(tabIndex)) return;

    const currentStates = this.tabStates.getValue();

    if (currentStates[tabIndex]?.dirty) return;

    const updatedStates = currentStates.map((state, index) =>
      index === tabIndex ? {...state, dirty: true} : state,
    );
    this.tabStates.next(updatedStates);
  }

  markTabAsClean(tabIndex: number): void {
    if (tabIndex < 0 || isNaN(tabIndex)) return;
    const currentStates = this.tabStates.getValue();
    if (!currentStates[tabIndex]?.dirty) return;

    const updatedStates = currentStates.map((state, index) =>
      index === tabIndex ? {...state, dirty: false} : state,
    );
    this.tabStates.next(updatedStates);
  }

  ignoreChanges(ignore: boolean): void {
    this.ignoreTabChanges = ignore;
  }

  getTabStates(): Observable<TabState[]> {
    return this.tabStates.asObservable();
  }

  hasUnsavedChanges(): boolean {
    return this.tabStates.getValue().some((state) => state.dirty);
  }

  isTabDirty(tabIndex: number): boolean {
    const states = this.tabStates.getValue();
    return states[tabIndex]?.dirty || false;
  }

  resetAllTabStates(): void {
    const currentStates = this.tabStates.getValue();
    const resetStates = currentStates.map((state) => ({
      ...state,
      dirty: false,
    }));
    this.tabStates.next(resetStates);
  }

  resetTab(tabIndex: number): void {
    this.resetEvent.next(tabIndex);
  }

  getResetEvent(): Observable<number> {
    return this.resetEvent.asObservable();
  }
}

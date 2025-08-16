import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FormMode} from '@core/models';

interface DrawerState {
  visible: boolean;
  mode: FormMode;
  title: string;
  data?: any;
  onCloseData?: any;
  submitButtonText: string;
  submitButtonIcon: string;
  id?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class DrawerService {
  private readonly defaultState: DrawerState = {
    visible: false,
    mode: 'add',
    title: '',
    submitButtonText: 'common.save',
    submitButtonIcon: 'pi pi-save',
    data: null,
    id: null,
  };

  public drawerState = new BehaviorSubject<DrawerState>(this.defaultState);

  drawerState$ = this.drawerState.asObservable();

  open(config: Partial<DrawerState>) {
    this.drawerState.next({
      ...this.drawerState.value,
      ...config,
      visible: true,
    });
  }

  close() {
    const currentState = this.drawerState.value;
    this.drawerState.next({
      ...this.defaultState,
      onCloseData: currentState.data,
      visible: false,
    });
  }
}

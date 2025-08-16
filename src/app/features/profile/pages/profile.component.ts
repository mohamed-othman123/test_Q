import {Component} from '@angular/core';
import {flipInYAnimation} from 'angular-animations';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    animations: [flipInYAnimation()],
    standalone: false
})
export class ProfileComponent {
  flipInYState = new BehaviorSubject(false);
  activeTab: 'info' | 'subscriptions' = 'info';

  constructor() {
    requestAnimationFrame(() => {
      this.flipInYState.next(true);
    });
  }

  setActiveTab(tab: 'info' | 'subscriptions') {
    this.activeTab = tab;
  }
}

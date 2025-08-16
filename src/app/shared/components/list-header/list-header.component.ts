import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Observable} from 'rxjs';

@Component({
    selector: 'app-list-header',
    templateUrl: './list-header.component.html',
    styleUrl: './list-header.component.scss',
    standalone: false
})
export class ListHeaderComponent {
  @Input() btnAddText!: string;
  @Input() icon!: string;
  @Input() disableAddBtn = false;
  @Input({required: true}) title!: string;
  @Output() sideDrawerToggler: EventEmitter<any> = new EventEmitter();
  bpo: Observable<BreakpointState>;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.bpo = this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.XSmall,
    ]);
  }

  toggleSideDrawer(): void {
    this.sideDrawerToggler.emit();
  }
}

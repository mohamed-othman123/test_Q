import {Component, HostListener, OnInit, OnDestroy} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {LanguageService} from '@core/services';
import {AuthService} from '@core/services/auth.service';
import {NavigationService} from '@core/services/navigation.service';
import {PermissionsService} from '@core/services/permissions.service';
import {SidenavService} from '@core/services/sidenav.service';
import {Hall} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: false,
})
export class HeaderComponent implements OnInit, OnDestroy {
  showUserOptions = false;
  private subs = new Subscription();
  currentHall = new FormControl<Hall | null>(
    this.hallsService.getCurrentHall(),
  );

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.showUserOptions = false;
  }

  constructor(
    public sideNavService: SidenavService,
    public langService: LanguageService,
    public auth: AuthService,
    public hallsService: HallsService,
    private router: Router,
    private navigationService: NavigationService,
    private authService: AuthService,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    const currentHallSub = this.hallsService.currentHall$.subscribe((hall) => {
      this.currentHall.setValue(hall);
    });
    this.subs.add(currentHallSub);
  }

  change(event: Hall) {
    this.hallsService.setCurrentHall(event);

    let page;

    const hasDashboardAccess =
      this.permissionsService.hasPermission('read:statistcs');

    if (hasDashboardAccess) {
      page = '/dashboard';
    }

    if (!hasDashboardAccess) {
      page = this.navigationService.getFirstAccessibleRoute(
        this.authService.userData?.user.role.permissions!,
      );
    }

    this.router.navigate([page], {
      state: {
        skipGuard: true,
      },
    });
  }

  toggleSideNav() {
    this.sideNavService.toggleSideNav();
  }

  changeLang() {
    const currentLang = this.langService.lang;
    this.langService.setLanguage(currentLang === 'ar' ? 'en' : 'ar');
  }

  signOut() {
    this.auth.logout();
  }

  toggleUserOptions(event: MouseEvent) {
    event.stopPropagation();
    this.showUserOptions = !this.showUserOptions;
  }
  navigateToUserProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToOrganization() {
    this.router.navigate(['/organization-info']);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

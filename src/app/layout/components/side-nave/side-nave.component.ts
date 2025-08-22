import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import {
  filter,
  Observable,
  tap,
  map,
  switchMap,
  takeUntil,
  Subject,
  combineLatest,
  startWith,
} from 'rxjs';
import {SidenavService} from '@core/services/sidenav.service';
import {AuthService, LanguageService} from '@core/services';
import {NavigationEnd, Router} from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {HallsService} from '@halls/services/halls.service';
import {PriceRequestService} from '@priceRequest/services/price-request.service';
import {UserData} from '@auth/models';
import {PermissionsService} from '@core/services/permissions.service';
import {APP_ENVIRONMENT} from '@core/constants';
import {Environment} from '@core/models';
import {TokenHelper} from '@core/utils/token-helper';

@Component({
    selector: 'app-side-nave',
    templateUrl: './side-nave.component.html',
    styleUrl: './side-nave.component.scss',
    animations: [
        trigger('openClose', [
            state('true', style({ width: '16rem' })),
            state('false', style({ width: '0px' })),
            transition('false <=> true', animate(200)),
        ]),
    ],
    standalone: false
})
export class SideNaveComponent implements OnInit, OnDestroy {
  sidebarVisible = false;
  sideNavPosition = 'right';
  breakPointObserver: Observable<BreakpointState>;
  isSettingsOpen = false;
  showMobileStyle = false;
  newPriceRequestsCount = 0;

  showVersionPopup = false;

  userData: UserData | null = this.authServices.userData;

  private destroy$ = new Subject<void>();

  currentHallWithLogo$ = this.hallsService.currentHall$.pipe(
    map((hall) => ({
      ...hall,
      hasValidLogo: hall?.logo_url && hall.logo_url.trim().length > 0,
    })),
  );

  constructor(
    public lang: LanguageService,
    public translateService: TranslateService,
    private breakpointObserver: BreakpointObserver,
    private sidNavService: SidenavService,
    private router: Router,
    public hallsService: HallsService,
    private priceRequestService: PriceRequestService,
    private authServices: AuthService,
    private permissionsService: PermissionsService,
    @Inject(APP_ENVIRONMENT) public env: Environment,
  ) {
    translateService.onLangChange.subscribe((event) => {
      this.sideNavPosition = event.lang === 'ar' ? 'right' : 'left';
    });

    this.breakPointObserver = this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.XSmall,
    ]);
    this.breakPointObserver.subscribe((isMobile) => {
      this.showMobileStyle = isMobile.matches;
      if (!isMobile.matches) {
        sidNavService.showSideNav();
      }
    });
    sidNavService.isVisibleSideNav.subscribe((isVisible) => {
      this.sidebarVisible = isVisible;
    });

    //open the settings if active route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (
          router.url === '/events' ||
          router.url === '/banks' ||
          router.url === '/payment-methods' ||
          router.url === '/employees' ||
          router.url === '/permissions' ||
          router.url === '/contract'
        ) {
          this.isSettingsOpen = true;
        }
      });
  }

  ngOnInit(): void {
    if (this.permissionsService.hasPermission('read:price-requests')) {
      combineLatest([
        this.hallsService.currentHall$,
        this.priceRequestService.updatePriceCount$.pipe(startWith(null)),
      ])
        .pipe(
          switchMap(([hall]) => {
            const filters = {
              hallId: hall?.id,
              status: 'New',
            };
            return this.priceRequestService.getPriceRequests(filters);
          }),
          tap((data) => (this.newPriceRequestsCount = data.items.length)),
          takeUntil(this.destroy$),
        )
        .subscribe();
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/icons/landmark.svg';
    }
  }

  hidSideNav() {
    this.sidNavService.hideSideNav();
  }

  toggleSettings() {
    this.isSettingsOpen = !this.isSettingsOpen;
  }

  clickSubItem(e: any) {
    e.stopPropagation();
  }

  get hasAiFeature(): boolean {
    return TokenHelper.hasAiFeature();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

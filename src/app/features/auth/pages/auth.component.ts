import {Component, OnDestroy} from '@angular/core';
import {NavigationEnd, NavigationStart, Router} from '@angular/router';
import {AuthService, LanguageService} from '@core/services';
import {flipInYAnimation} from 'angular-animations';
import {BehaviorSubject, Subscription} from 'rxjs';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.scss',
    animations: [flipInYAnimation()],
    standalone: false
})
export class AuthComponent implements OnDestroy {
  flipInYState = new BehaviorSubject(false);
  subs = new Subscription();
  isLogin!: boolean;
  isRegister!: boolean;
  constructor(
    private router: Router,
    private languageService: LanguageService,
    public authService: AuthService,
  ) {
    const sub = router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        requestAnimationFrame(() => {
          this.flipInYState.next(true);
        });
        this.isLogin = event.url.includes('auth/login');
        this.isRegister = event.url.includes('auth/signup');
      } else if (event instanceof NavigationStart) {
        this.flipInYState.next(false);
      }
    });
    this.subs.add(sub);
  }

  changeLang(lang: string) {
    this.languageService.setLanguage(lang);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

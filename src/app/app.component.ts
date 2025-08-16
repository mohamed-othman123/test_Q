import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';

import {LoaderService} from '@core/services';
import {AuthService} from '@core/services/auth.service';
import {
  AnimationLoader,
  AnimationOptions,
  provideLottieOptions,
} from 'ngx-lottie';
import player from 'lottie-web';
import {
  Router,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  GuardsCheckEnd,
} from '@angular/router';
import {HallsService} from '@halls/services/halls.service';
import {FaviconService} from '@core/services/favicon.service';
import {logAppVersion} from '@core/utils';
import {APP_ENVIRONMENT} from '@core/constants';
import {Environment} from '@core/models';
import {AnalyticsService} from '@core/analytics';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [
        provideLottieOptions({
            player: () => player,
        }),
        AnimationLoader,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'Qaatk.Online';
  isLayoutVisible: boolean = false;
  options: AnimationOptions = {
    path: '/assets/lottie/green-loader.json',
  };
  loadingSkelton: boolean = false;

  constructor(
    public auth: AuthService,
    public hallsService: HallsService,
    public loader: LoaderService,
    private router: Router,
    private faviconService: FaviconService,
    @Inject(APP_ENVIRONMENT) private env: Environment,
    private analytics: AnalyticsService,
  ) {}
  ngOnInit(): void {
    logAppVersion(this.env.appVersion);

    this.router.events.subscribe((event) => {
      if (event instanceof GuardsCheckEnd) {
        // show skeleton on dashboard only
        this.loadingSkelton = event.url.includes('/dashboard') ? true : false;
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingSkelton = false;
        this.isLayoutVisible =
          event.url.includes('/lp') || event.url.includes('preview');
      }
    });

    this.faviconService.setFavIcon('/assets/favicon/favicon-96x96.png');
  }
}

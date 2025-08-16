import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {GtagService} from './gtag.service';
import {filter} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor(
    private router: Router,
    private gtag: GtagService,
  ) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        const nav = e as NavigationEnd;

        setTimeout(() => {
          this.gtag.pageView(nav.urlAfterRedirects, document.title);
        });
      });
  }
}

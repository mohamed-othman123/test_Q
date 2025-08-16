import {Inject, Injectable} from '@angular/core';
import {APP_ENVIRONMENT} from '@core/constants';
import {Environment} from '@core/models';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

@Injectable({
  providedIn: 'root',
})
export class GtagService {
  constructor(@Inject(APP_ENVIRONMENT) private env: Environment) {}

  // (Re‑)configure GA4 with ID + user properties; we turn off auto page_view
  config(measurementId: string, userProps: Record<string, any>) {
    if (!this.env.enableGoogleAnalytics) return;

    window.gtag('config', measurementId, {
      send_page_view: false,
      ...userProps,
    });
  }

  // Send a manual page_view hit
  pageView(path: string, title?: string) {
    if (!this.env.enableGoogleAnalytics) return;

    window.gtag('event', 'page_view', {page_path: path, page_title: title});
  }

  // Send any custom event
  event(eventName: string, params: Record<string, any> = {}) {
    if (!this.env.enableGoogleAnalytics) return;

    window.gtag('event', eventName, params);
  }
}

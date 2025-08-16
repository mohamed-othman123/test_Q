import {Injectable, Injector} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {RouterStateSnapshot, TitleStrategy} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {startWith} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomTitleStrategy extends TitleStrategy {
  constructor(
    private title: Title,
    private injector: Injector,
  ) {
    super();
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const translate = this.injector.get(TranslateService);

    let node = snapshot.root;
    let titleKey: string | undefined;

    while (node) {
      const cfg = node.routeConfig;
      if (cfg?.data?.['title']) {
        titleKey = cfg.data!['title'];
      }
      node = node.firstChild!;
    }

    // If we never found a titleKey, use the app default.
    const finalKey = titleKey ?? 'pageTitles.appName';

    translate.onLangChange
      .pipe(startWith(translate.currentLang))
      .subscribe(() => {
        const finalTitle = translate.instant(finalKey);

        this.title.setTitle(finalTitle);
      });
  }
}

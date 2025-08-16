
import {Inject, Injectable, DOCUMENT} from '@angular/core';
import {StorageKeys} from '@core/enums';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  public dir = 'rtl';
  public lang!: string;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private translate: TranslateService,
  ) {}

  initialize(): void {
    const lang = localStorage.getItem(StorageKeys.LOCALE);
    if (lang && (lang === 'ar' || lang === 'en')) {
      this.setLanguage(lang);
    } else {
      this.setLanguage('ar');
    }
  }

  setLanguage(lang: string): void {
    this.lang = lang;
    localStorage.setItem(StorageKeys.LOCALE, lang);
    const html = this.document.getElementsByTagName(
      'html',
    )[0] as HTMLHtmlElement;
    this.dir = lang === 'ar' ? 'rtl' : 'ltr';
    html.dir = this.dir;
    html.lang = lang;
    this.translate.use(lang);
  }

  getCurrentLanguage(): string {
    return this.lang;
  }
}

import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {LanguageService} from './language.service';
import {PrimeNGConfig} from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class LocalizationInitService {
  constructor(
    private languageService: LanguageService,
    private translate: TranslateService,
    private config: PrimeNGConfig,
  ) {}

  initializeLocalization(): Promise<void> {
    return new Promise<void>((resolve) => {
      // Initialize language first
      this.languageService.initialize();

      // Then set up translation
      this.translate.addLangs(['en', 'ar']);
      this.translate.setDefaultLang('ar');
      const currentLang = this.languageService.getCurrentLanguage();
      this.translate.use(currentLang);

      // Set up PrimeNG translations
      this.translate
        .get('primeng')
        .subscribe((res) => this.config.setTranslation(res));

      resolve();
    });
  }
}

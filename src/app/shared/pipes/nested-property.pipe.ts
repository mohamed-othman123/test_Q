import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
    name: 'optionLabel',
    pure: false,
    standalone: false
})
export class OptionLabelPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(obj: any, path: string): any {
    if (!obj) return '';

    // Special handling for name/name_ar
    if (path === 'name') {
      return this.translate.currentLang === 'ar' && obj.name_ar
        ? obj.name_ar
        : obj.name;
    }

    // Default nested property handling
    return path.split('.').reduce((o, key) => o && o[key], obj);
  }
}

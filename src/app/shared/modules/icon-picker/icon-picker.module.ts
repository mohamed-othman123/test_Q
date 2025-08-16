import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VanillaIconPickerDirective} from '@shared/directives/vanilla-icon-picker.directive';

@NgModule({
  declarations: [VanillaIconPickerDirective],
  imports: [CommonModule],
  exports: [VanillaIconPickerDirective],
})
export class IconPickerModule {}

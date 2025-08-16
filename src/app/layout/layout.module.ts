import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {HeaderComponent} from './components/header/header.component';
import {SideNaveComponent} from './components/side-nave/side-nave.component';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '@shared/shared.module';
import {LatestVersionsComponent} from './components/latest-versions/latest-versions.component';
import {CollapseCardComponent} from './components/latest-versions/components/collapse-card/collapse-card.component';

@NgModule({
  declarations: [
    HeaderComponent,
    SideNaveComponent,
    LatestVersionsComponent,
    CollapseCardComponent,
  ],
  exports: [HeaderComponent, SideNaveComponent],
  imports: [SharedModule, RouterModule],
})
export class LayoutModule {}

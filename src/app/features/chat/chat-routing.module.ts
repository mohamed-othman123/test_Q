import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AnalyticsGuard} from '@core/guards/analytics.guard';
import {ChatInterfaceComponent} from './components/chat-interface.component';

const routes: Routes = [
  {
    path: '',
    component: ChatInterfaceComponent,
    canActivate: [AnalyticsGuard],
    data: { title: 'pageTitles.aiChat' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule {}

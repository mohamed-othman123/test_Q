import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {ChipModule} from 'primeng/chip';
import {SharedModule} from '@shared/shared.module';
import {ChatInterfaceComponent} from './components/chat-interface.component';
import {ChatRoutingModule} from './chat-routing.module';

@NgModule({
  declarations: [ChatInterfaceComponent],
  imports: [
    RouterModule,
    InputTextareaModule,
    ChipModule,
    TranslatePipe,
    SharedModule,
    ChatRoutingModule
  ],
  exports: [ChatInterfaceComponent],
  providers: [],
})
export class ChatModule {}

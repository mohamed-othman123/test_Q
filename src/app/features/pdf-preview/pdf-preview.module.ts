import {NgModule} from '@angular/core';
import {PdfPreviewComponent} from './containers/pdf-preview.component';
import {CommonModule} from '@angular/common';
import {PdfPreviewRoutingModule} from './pdf-preview-routing.module';
import {PdfPreviewService} from './services/pdf-preview.service';

@NgModule({
  declarations: [PdfPreviewComponent],
  imports: [CommonModule, PdfPreviewRoutingModule],
  providers: [PdfPreviewService],
})
export class PdfPreviewModule {}

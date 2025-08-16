import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PdfPreviewComponent} from './containers/pdf-preview.component';

const routes: Routes = [
  {
    path: ':id',
    component: PdfPreviewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PdfPreviewRoutingModule {}

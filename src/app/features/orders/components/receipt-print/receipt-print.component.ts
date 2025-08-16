import {Component, OnInit, OnDestroy} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import {DynamicDialogConfig} from 'primeng/dynamicdialog';

@Component({
    selector: 'app-receipt-print',
    templateUrl: './receipt-print.component.html',
    styleUrls: ['./receipt-print.component.scss'],
    standalone: false
})
export class ReceiptPrintComponent implements OnInit, OnDestroy {
  pdfUrl: SafeResourceUrl | null = null;
  private pdfBlobUrl: string | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    public config: DynamicDialogConfig,
  ) {}

  ngOnInit() {
    if (this.config.data?.url) {
      this.loadPdf(this.config.data.url);
    }
  }

  ngOnDestroy() {
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl);
    }
  }

  loadPdf(url: string) {
    this.http
      .get(url, {
        responseType: 'blob',
        observe: 'response',
      })
      .subscribe({
        next: (response) => {
          const blob = new Blob([response.body as Blob], {
            type: 'application/pdf',
          });
          this.pdfBlobUrl = URL.createObjectURL(blob);
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.pdfBlobUrl,
          );
        },
      });
  }
}
